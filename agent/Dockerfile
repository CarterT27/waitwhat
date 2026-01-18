FROM node:22-slim

RUN apt-get update -qq && \
    apt-get install --no-install-recommends -y python3 build-essential && \
    rm -rf /var/lib/apt/lists/*

WORKDIR /app

COPY package.json package-lock.json* ./
RUN npm install

COPY . .

CMD ["npm", "start"]
