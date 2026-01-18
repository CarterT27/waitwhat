# Use Bun's official Docker image
FROM oven/bun:1 as base
WORKDIR /app

# Install dependencies
COPY package.json bun.lock* ./
RUN bun install --frozen-lockfile

# Copy application code
COPY . .

# Run the agent
CMD ["bun", "run", "index.ts", "start"]
