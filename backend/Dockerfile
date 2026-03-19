# ---- Build ----
FROM node:20-alpine AS builder

WORKDIR /app

COPY package*.json ./

RUN npm ci

COPY . .

RUN npm run build

# ---- Production ----
FROM node:20-alpine

WORKDIR /app

ENV NODE_ENV=production

COPY package*.json ./

# chỉ cài dependency cần thiết
RUN npm ci --omit=dev

# copy build
COPY --from=builder /app/dist ./dist

# tạo folder upload
RUN mkdir -p uploads

# 🔥 giảm memory node
ENV NODE_OPTIONS=--max-old-space-size=256

EXPOSE 3000

CMD ["node", "dist/main.js"]