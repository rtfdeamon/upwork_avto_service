FROM node:18-alpine
WORKDIR /app

# Install pnpm
RUN corepack enable && corepack prepare pnpm@8.15.4 --activate || npm i -g pnpm

# Copy workspace manifests first for better caching
COPY pnpm-lock.yaml package.json pnpm-workspace.yaml ./
COPY apps/web/package.json apps/web/package.json
COPY packages/common/package.json packages/common/package.json
COPY packages/react-charts/package.json packages/react-charts/package.json

# Install dependencies (workspace)
RUN pnpm install --frozen-lockfile

# Copy sources
COPY . .

# Build Next.js web app
RUN pnpm --filter web build

ENV PORT=3000
EXPOSE 3000

CMD ["pnpm", "--filter", "web", "start"]

