# ---- Build ----
FROM node:20-alpine AS builder

WORKDIR /app

# Tăng RAM cho Angular build
ENV NODE_OPTIONS=--max-old-space-size=1024

COPY package*.json ./

RUN if [ -f package-lock.json ]; then npm ci; else npm install; fi

COPY . .

# build production nhẹ hơn
RUN npm run build -- --configuration production --source-map=false

# ---- Nginx serve ----
FROM nginx:1.25-alpine

RUN rm -rf /usr/share/nginx/html/*

# ⚠️ Angular thường nằm trong browser/
COPY --from=builder /app/dist/paintco-frontend/browser /usr/share/nginx/html

COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]