# Use Deno runtime image
FROM denoland/deno:alpine AS runtime

# Set working directory
WORKDIR /app

# Copy dependency files (no deno.lock in denoise-docs)
COPY denoise-docs/deno.json ./

# Copy server code
COPY denoise-docs/src/app/ ./src/app/

# Copy Astro static build output
COPY denoise-docs/dist/ ./dist/

# Expose port (matches serve.ts default)
EXPOSE 4321

# Run the application (env from compose env_file)
CMD ["run", "-A", "src/app/serve.ts"]
