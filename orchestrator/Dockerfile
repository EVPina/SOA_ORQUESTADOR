# Etapa 1: build
FROM maven:3.9.9-eclipse-temurin-17 AS build
WORKDIR /app
COPY . .
RUN mvn clean package -DskipTests

# Etapa 2: runtime
FROM eclipse-temurin:17-jdk-alpine

RUN addgroup -S appgroup && adduser -S appuser -G appgroup

WORKDIR /app

# 🔥 AQUÍ ESTÁ EL CAMBIO IMPORTANTE
COPY --from=build /app/target/*.jar app.jar
EXPOSE 8080
RUN adduser -D appuser
USER appuser
ENTRYPOINT ["java", "-jar", "app.jar"]