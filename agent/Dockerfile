FROM oven/bun:1 AS base

RUN apt-get update -qq && \
    apt-get install --no-install-recommends -y python3 build-essential && \
    rm -rf /var/lib/apt/lists/*

WORKDIR /app

COPY package.json bun.lock ./
RUN bun install --frozen-lockfile

COPY . .

CMD ["bun", "run", "start"]
