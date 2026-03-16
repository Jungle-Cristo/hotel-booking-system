# 基于 maven:3.9.9-eclipse-temurin-17 镜像
FROM maven:3.9.9-eclipse-temurin-17

# 设置工作目录
WORKDIR /app

# 复制 JAR 文件到容器中
COPY target/hotel-booking-system-1.0.0.jar app.jar

# 暴露端口
EXPOSE 8080

# 设置环境变量
ENV DB_HOST=mysql
ENV DB_PORT=3306
ENV DB_NAME=hotel_booking
ENV DB_USER=root
ENV DB_PASSWORD=123456
ENV REDIS_HOST=redis
ENV REDIS_PORT=6379
ENV JWT_SECRET=hotel_booking_secret_key

# 运行应用
ENTRYPOINT ["java", "-jar", "app.jar"]