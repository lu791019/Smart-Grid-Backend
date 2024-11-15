FROM node:20-alpine AS base

FROM base AS builder



RUN apk add --no-cache libc6-compat yarn
WORKDIR /app

# 复制必要的文件
COPY package*.json  ./
COPY tsconfig.json ./
COPY src ./src

# 安装依赖项并构建项目
RUN yarn install --frozen-lockfile && \
    yarn build && \
    yarn install --production --frozen-lockfile

FROM base AS runner
WORKDIR /app

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 hono

COPY --from=builder --chown=hono:nodejs /app/node_modules /app/node_modules
COPY --from=builder --chown=hono:nodejs /app/dist /app/dist
COPY --from=builder --chown=hono:nodejs /app/package.json /app/package.json
# 创建 /app/public/logs 目录
RUN mkdir -p /app/public/logs
COPY ca /app/ca
COPY config /app/config
COPY migrations /app/migrations

#USER hono
EXPOSE 3000
# 执行数据库迁移并启动应用程序
CMD ["sh", "-c", "npx sequelize-cli db:migrate && node /app/dist/index.js"]