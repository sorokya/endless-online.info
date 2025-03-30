FROM node:22-alpine AS builder

# Install dependencies required by node-canvas
RUN apk add build-base g++ cairo-dev pango-dev giflib-dev py-setuptools

WORKDIR /app

COPY package.json pnpm-lock.yaml ./
RUN npm install -g pnpm
RUN pnpm install --frozen-lockfile

COPY . . 
RUN pnpm build

FROM node:22-alpine

WORKDIR /app

RUN apk add build-base g++ cairo-dev pango-dev giflib-dev py-setuptools

COPY package.json pnpm-lock.yaml ./
RUN npm install -g pnpm
RUN pnpm install --prod --frozen-lockfile

COPY --from=builder /app/build ./build

EXPOSE 3000

CMD ["pnpm", "start"]
