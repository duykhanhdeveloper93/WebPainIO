#!/bin/sh
# Script này chạy trên Render khi build frontend
# Thay BACKEND_URL_PLACEHOLDER bằng URL thật của backend

BACKEND_URL=${BACKEND_URL:-https://paintco-backend.onrender.com}

echo "Building with backend URL: $BACKEND_URL"

# Thay placeholder trong environment file
sed -i "s|BACKEND_URL_PLACEHOLDER|$BACKEND_URL|g" \
  src/environments/environment.production.ts

npm install
npm run build
