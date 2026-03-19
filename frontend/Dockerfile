# ---- Build stage ----
FROM node:20-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build

# ---- Nginx serve stage ----
FROM nginx:1.25-alpine AS production
RUN mkdir -p /usr/share/nginx/html
COPY --from=builder /app/dist/paintco-frontend/browser /usr/share/nginx/html
# Fallback nếu không có subfolder browser/
RUN if [ -z "$(ls /usr/share/nginx/html)" ]; then cp -r /app/dist/paintco-frontend/* /usr/share/nginx/html/; fi
COPY nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
