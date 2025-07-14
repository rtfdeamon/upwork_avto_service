FROM node:18-alpine
WORKDIR /app
COPY package.json pnpm-workspace.yaml ./
COPY apps/worker/package.json ./apps/worker/package.json
RUN corepack enable && pnpm install --frozen-lockfile --filter worker...
COPY apps/worker ./apps/worker
RUN pnpm --filter worker run build
CMD ["node", "apps/worker/dist/index.js"]
