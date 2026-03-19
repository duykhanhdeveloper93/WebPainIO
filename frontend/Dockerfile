# ---- Build ----
FROM node:20-alpine AS builder

WORKDIR /app

# Tăng RAM cho Angular build
ENV NODE_OPTIONS=--max-old-space-size=512

COPY package*.json ./

# fallback nếu thiếu lock file
RUN if [ -f package-lock.json ]; then npm ci; else npm install; fi

COPY . .

RUN npm run build

# ---- Nginx serve ----
FROM nginx:1.25-alpine

# clear default nginx
RUN rm -rf /usr/share/nginx/html/*

# copy build
COPY --from=builder /app/dist /usr/share/nginx/html

COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]