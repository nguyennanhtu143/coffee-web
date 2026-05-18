# Stage 1: Build React App
FROM node:18-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
# Lệnh build này sẽ tự động ăn cấu hình từ .env.production
RUN npm run build 

# Stage 2: Serve bằng Nginx
FROM nginx:alpine
# Lưu ý: Vite dùng thư mục /dist, CRA dùng thư mục /build
COPY --from=builder /app/dist /usr/share/nginx/html
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]