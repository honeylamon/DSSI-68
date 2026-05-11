# --- Stage 1: สร้างตัว Build ---
FROM node:18-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build 

# --- Stage 2: นำไฟล์ไปรันบน Nginx ---
FROM nginx:alpine
# หมายเหตุ: ถ้าคุณใช้ Create React App ให้เปลี่ยน /app/dist เป็น /app/build
COPY --from=builder /app/dist /usr/share/nginx/html
# เอาไฟล์ตั้งค่า Nginx ของเราไปทับของเดิม
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]