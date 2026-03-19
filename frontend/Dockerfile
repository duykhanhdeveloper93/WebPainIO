# ---- Build ----
FROM node:20-alpine AS builder

WORKDIR /app

# 🔥 Giảm RAM để tránh crash VPS
ENV NODE_OPTIONS=--max-old-space-size=512

COPY package*.json ./

RUN npm ci

COPY . .

# build production (tối ưu size)
RUN npm run build -- --configuration production --source-map=false

# ---- Nginx serve ----
FROM nginx:1.25-alpine

# xoá default
RUN rm -rf /usr/share/nginx/html/*

# copy build
COPY --from=builder /app/dist/paintco-frontend/browser /usr/share/nginx/html

# config nginx
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]