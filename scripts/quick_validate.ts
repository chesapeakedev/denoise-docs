#!/usr/bin/env -S deno run --allow-read

const MAX_SKILL_NAME_LENGTH = 64;
const ALLOWED_PROPERTIES = new Set([
  "name",
  "description",
  "license",
  "allowed-tools",
  "metadata",
]);

type Frontmatter = Record<string, unknown>;

function usage(): never {
  console.error(
    "Usage: deno run --allow-read scripts/quick_validate.ts <skill_directory>",
  );
  Deno.exit(1);
}

function fail(message: string): never {
  console.log(message);
  Deno.exit(1);
}

function ok(message: string): never {
  console.log(message);
  Deno.exit(0);
}

function parseScalar(raw: string): unknown {
  const value = raw.trim();
  if (value === "") return "";
  if (value === "{}") return {};
  if (value === "[]") return [];
  if (
    (value.startsWith('"') && value.endsWith('"')) ||
    (value.startsWith("'") && value.endsWith("'"))
  ) {
    return value.slice(1, -1);
  }
  if (value === "true") return true;
  if (value === "false") return false;
  if (value === "null" || value === "~") return null;
  return value;
}

function stripIndent(lines: string[]): string[] {
  const nonBlank = lines.filter((line) => line.trim() !== "");
  const minIndent = nonBlank.reduce((min, line) => {
    const indent = line.match(/^ */)?.[0].length ?? 0;
    return Math.min(min, indent);
  }, Number.POSITIVE_INFINITY);

  if (!Number.isFinite(minIndent) || minIndent === 0) return lines;
  return lines.map((line) =>
    line.startsWith(" ".repeat(minIndent)) ? line.slice(minIndent) : line
  );
}

function parseBlockScalar(
  lines: string[],
  folded: boolean,
  chomp: "strip" | "clip",
): string {
  const stripped = stripIndent(lines);
  if (!folded) {
    const literal = stripped.join("\n");
    return chomp === "strip" ? literal.replace(/\n+$/, "") : `${literal}\n`;
  }

  const paragraphs: string[] = [];
  let current: string[] = [];
  for (const line of stripped) {
    if (line.trim() === "") {
      if (current.length > 0) {
        paragraphs.push(current.join(" "));
        current = [];
      }
      paragraphs.push("");
    } else {
      current.push(line.trim());
    }
  }
  if (current.length > 0) paragraphs.push(current.join(" "));

  const foldedText = paragraphs.join("\n").replace(/\n{3,}/g, "\n\n");
  return chomp === "strip" ? foldedText.replace(/\n+$/, "") : `${foldedText}\n`;
}

function parseNestedMap(lines: string[]): Frontmatter {
  const result: Frontmatter = {};
  for (const line of stripIndent(lines)) {
    if (line.trim() === "" || line.trimStart().startsWith("#")) continue;
    const match = line.match(/^([A-Za-z0-9_-]+):(?:\s*(.*))?$/);
    if (!match) {
      throw new Error(`unsupported nested YAML line: ${line}`);
    }
    result[match[1]] = parseScalar(match[2] ?? "");
  }
  return result;
}

function parseFrontmatter(text: string): Frontmatter {
  const lines = text.split(/\r?\n/);
  const result: Frontmatter = {};

  for (let index = 0; index < lines.length; index += 1) {
    const line = lines[index];
    if (line.trim() === "" || line.trimStart().startsWith("#")) continue;

    const match = line.match(/^([A-Za-z0-9_-]+):(?:\s*(.*))?$/);
    if (!match) {
      throw new Error(`unsupported YAML line: ${line}`);
    }

    const key = match[1];
    if (Object.hasOwn(result, key)) {
      throw new Error(`duplicate key: ${key}`);
    }

    const rawValue = match[2] ?? "";
    if (/^[>|][-+]?$/.test(rawValue.trim())) {
      const blockLines: string[] = [];
      while (index + 1 < lines.length && /^(?:\s+|$)/.test(lines[index + 1])) {
        blockLines.push(lines[index + 1]);
        index += 1;
      }
      const marker = rawValue.trim();
      result[key] = parseBlockScalar(
        blockLines,
        marker.startsWith(">"),
        marker.endsWith("-") ? "strip" : "clip",
      );
      continue;
    }

    if (rawValue.trim() === "") {
      const nestedLines: string[] = [];
      while (index + 1 < lines.length && /^(?:\s+|$)/.test(lines[index + 1])) {
        nestedLines.push(lines[index + 1]);
        index += 1;
      }
      result[key] = nestedLines.length > 0 ? parseNestedMap(nestedLines) : "";
      continue;
    }

    result[key] = parseScalar(rawValue);
  }

  return result;
}

async function exists(path: string): Promise<boolean> {
  try {
    await Deno.stat(path);
    return true;
  } catch (error) {
    if (error instanceof Deno.errors.NotFound) return false;
    throw error;
  }
}

async function validateSkill(skillPath: string): Promise<[boolean, string]> {
  const skillMd = `${skillPath.replace(/\/+$/, "")}/SKILL.md`;
  if (!(await exists(skillMd))) {
    return [false, "SKILL.md not found"];
  }

  const content = await Deno.readTextFile(skillMd);
  if (!content.startsWith("---")) {
    return [false, "No YAML frontmatter found"];
  }

  const match = content.match(/^---\r?\n([\s\S]*?)\r?\n---(?:\r?\n|$)/);
  if (!match) {
    return [false, "Invalid frontmatter format"];
  }

  let frontmatter: Frontmatter;
  try {
    frontmatter = parseFrontmatter(match[1]);
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    return [false, `Invalid YAML in frontmatter: ${message}`];
  }

  if (
    frontmatter === null || Array.isArray(frontmatter) ||
    typeof frontmatter !== "object"
  ) {
    return [false, "Frontmatter must be a YAML dictionary"];
  }

  const unexpectedKeys = Object.keys(frontmatter).filter((key) =>
    !ALLOWED_PROPERTIES.has(key)
  );
  if (unexpectedKeys.length > 0) {
    const allowed = [...ALLOWED_PROPERTIES].sort().join(", ");
    const unexpected = unexpectedKeys.sort().join(", ");
    return [
      false,
      `Unexpected key(s) in SKILL.md frontmatter: ${unexpected}. Allowed properties are: ${allowed}`,
    ];
  }

  if (!Object.hasOwn(frontmatter, "name")) {
    return [false, "Missing 'name' in frontmatter"];
  }
  if (!Object.hasOwn(frontmatter, "description")) {
    return [false, "Missing 'description' in frontmatter"];
  }

  const name = frontmatter.name;
  if (typeof name !== "string") {
    return [
      false,
      `Name must be a string, got ${
        Array.isArray(name) ? "array" : typeof name
      }`,
    ];
  }

  const trimmedName = name.trim();
  if (trimmedName !== "") {
    if (!/^[a-z0-9-]+$/.test(trimmedName)) {
      return [
        false,
        `Name '${trimmedName}' should be hyphen-case (lowercase letters, digits, and hyphens only)`,
      ];
    }
    if (
      trimmedName.startsWith("-") || trimmedName.endsWith("-") ||
      trimmedName.includes("--")
    ) {
      return [
        false,
        `Name '${trimmedName}' cannot start/end with hyphen or contain consecutive hyphens`,
      ];
    }
    if (trimmedName.length > MAX_SKILL_NAME_LENGTH) {
      return [
        false,
        `Name is too long (${trimmedName.length} characters). Maximum is ${MAX_SKILL_NAME_LENGTH} characters.`,
      ];
    }
  }

  const description = frontmatter.description;
  if (typeof description !== "string") {
    return [
      false,
      `Description must be a string, got ${
        Array.isArray(description) ? "array" : typeof description
      }`,
    ];
  }

  const trimmedDescription = description.trim();
  if (trimmedDescription !== "") {
    if (trimmedDescription.includes("<") || trimmedDescription.includes(">")) {
      return [false, "Description cannot contain angle brackets (< or >)"];
    }
    if (trimmedDescription.length > 1024) {
      return [
        false,
        `Description is too long (${trimmedDescription.length} characters). Maximum is 1024 characters.`,
      ];
    }
  }

  return [true, "Skill is valid!"];
}

if (import.meta.main) {
  if (Deno.args.length !== 1) usage();
  const [valid, message] = await validateSkill(Deno.args[0]);
  if (valid) ok(message);
  fail(message);
}
