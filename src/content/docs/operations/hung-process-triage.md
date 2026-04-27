---
title: Hung process triage
description: Debug hung processes on macOS (kickstart, deno, etc.).
---

This document describes tools and techniques for debugging hung processes on
macOS (e.g. kickstart or deno not exiting).

## 1. Activity Monitor (GUI)

- Open **Activity Monitor** (Applications → Utilities)
- Find the process (e.g. `kickstart` or `deno`)
- Check **CPU**, **Memory**, and **Threads** tabs
- Use **Inspect Process** to see open files and network connections

## 2. `lsof` — list open files

Shows files, sockets, and resources the process has open:

```bash
# Find the process ID first
ps aux | grep kickstart

# List all open files/sockets for that PID
lsof -p <PID>

# Or in one command:
lsof -p $(pgrep -f kickstart)
```

Look for: open network connections (fetch calls), file handles that aren't
closed, pipes or sockets.

## 3. `sample` — process sampling

Captures a stack trace of what the process is doing:

```bash
# Sample for 10 seconds
sample <PID> 10

# Or find and sample in one go
sample $(pgrep -f kickstart) 10
```

This shows where the process is stuck (function calls, waiting on I/O, etc.).

## 4. `dtrace` / `dtruss` — system call tracing

Shows system calls the process is making:

```bash
# Trace system calls (requires sudo)
sudo dtruss -p <PID>

# Or trace a specific process from start
sudo dtruss -f ./kickstart <issue_url_or_number>
```

Look for: `select()`, `poll()`, `kevent()` (waiting on I/O); network or file ops
that hang.

## 5. `strace` (if installed via Homebrew)

Similar to dtruss but Linux-style:

```bash
brew install strace
strace -p <PID>
```

## 6. `vmmap` — memory map

Shows memory regions and what's mapped:

```bash
vmmap <PID>
```

## 7. `fs_usage` — file system activity

Real-time file system operations:

```bash
sudo fs_usage -w -f filesys <PID>
```

## 8. Network monitoring

Check if network calls are hanging:

```bash
# Show network connections
netstat -an | grep <PID>

# Or use lsof for network
lsof -i -p <PID>
```

## Quick debugging script

One-liner for comprehensive info:

```bash
PID=$(pgrep -f kickstart | head -1)
echo "=== Process Info ==="
ps -p $PID -o pid,ppid,command,etime,state
echo -e "\n=== Open Files/Sockets ==="
lsof -p $PID
echo -e "\n=== Network Connections ==="
lsof -i -p $PID
echo -e "\n=== Sampling (10 seconds) ==="
sample $PID 10
```

## Most useful for hung processes

If logs show completion but the process doesn't exit, try in order:

1. **`lsof -p <PID>`** — Check for open network connections (fetch calls)
2. **`sample <PID> 10`** — Stack trace to see what it's waiting on
3. **`dtruss -p <PID>`** — See if it's stuck in a system call

The `sample` command is often the most useful—it shows the call stack and where
execution is stuck.

## Example workflow

```bash
# 1. Find the process
ps aux | grep kickstart

# 2. Get its PID (e.g. 12345)
PID=12345

# 3. Check what it has open
lsof -p $PID

# 4. Sample to see where it's stuck
sample $PID 10 > /tmp/sample-output.txt

# 5. Review the sample output
cat /tmp/sample-output.txt
```

## Notes

- Most commands require the process to still be running
- `sample` and `dtruss` may slow the process slightly
- Network-related hangs often show as open TCP connections in `lsof`
- If the process is waiting on I/O, `sample` will show it in a `select()` or
  `poll()` call
