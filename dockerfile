# Sử dụng Ubuntu 20.04 làm base image
FROM ubuntu:20.04

# Cập nhật và cài đặt curl
RUN apt-get update && apt-get install -y curl

# Cài đặt Node.js 20
RUN curl -fsSL https://deb.nodesource.com/setup_20.x | bash - \
    && apt-get install -y nodejs

# Cài đặt npm phiên bản 11
RUN npm install -g npm@11.0.0


# Thiết lập thư mục làm việc trong container
WORKDIR /app

# Copy package.json và package-lock.json vào thư mục làm việc
COPY package*.json ./

# Cài đặt các gói phụ thuộc cho dự án
RUN npm install

# Copy toàn bộ mã nguồn vào container
COPY . .

# Mở port 3000 cho ứng dụng React
EXPOSE 3000

# Lệnh chạy ứng dụng khi container bắt đầu
CMD ["npm", "start"]
