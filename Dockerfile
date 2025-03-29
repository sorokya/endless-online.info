FROM node:22-alpine AS builder

WORKDIR /app

COPY package.json pnpm-lock.yaml ./
RUN npm install -g pnpm
RUN pnpm install --frozen-lockfile

COPY . . 
RUN pnpm build

FROM node:22-alpine

WORKDIR /app

COPY package.json pnpm-lock.yaml ./
RUN npm install -g pnpm
RUN pnpm install --prod --frozen-lockfile

COPY --from=builder /app/build ./build

EXPOSE 3000

CMD ["pnpm", "start"]
