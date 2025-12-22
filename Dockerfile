# 阶段1: 构建阶段
FROM node:18-alpine AS builder
WORKDIR /app

# 1. 复制 package 文件（利用缓存层）
COPY package*.json ./
COPY package-lock.json* ./

# 2. 使用 npm ci 替代 npm install（更快、更稳定）
RUN npm install --registry=https://registry.npmmirror.com

# 3. 复制源代码
COPY . .

# 4. 处理 .env
RUN [ ! -f ".env" ] && cp .env.example .env || true

# 5. 构建应用
RUN npm run build

# 阶段2: 生产阶段
FROM node:18-alpine
WORKDIR /app

# 设置生产环境
ENV NODE_ENV=production

# 1. 只复制必要的文件
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/package.json ./package.json

# 2. 安装生产依赖（不安装 devDependencies）
RUN npm ci --registry=https://registry.npmmirror.com --only=production && \
    npm cache clean --force

# 3. 如果必须用 http-server，但更推荐用 serve
RUN npm install -g serve

# 4. 创建非 root 用户运行（安全考虑）
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nodejs -u 1001 && \
    chown -R nodejs:nodejs /app
USER nodejs

EXPOSE 12445

# 使用 serve 替代 http-server（更好用）
CMD ["serve", "-s", "dist", "-l", "12445"]