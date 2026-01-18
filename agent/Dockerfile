# Use Node.js for production - required for native modules like onnxruntime-node
# (Bun doesn't fully support these yet)
FROM node:22-slim

RUN apt-get update -qq && \
    # NOTE: @livekit/rtc-node uses a Rust engine that relies on the OS trust store.
    # node:*-slim does NOT include CA certs by default, which causes TLS failures like:
    # "failed to retrieve region info" when connecting to LiveKit Cloud.
    apt-get install --no-install-recommends -y ca-certificates python3 build-essential && \
    update-ca-certificates && \
    rm -rf /var/lib/apt/lists/*

WORKDIR /app

COPY package.json ./
RUN npm install

COPY . .

CMD ["npm", "start"]
