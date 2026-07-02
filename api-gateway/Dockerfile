FROM eclipse-temurin:17-jdk-alpine
WORKDIR /app
COPY target/api-gateway-1.0.0.jar app.jar
EXPOSE 8889
RUN adduser -D appuser
USER appuser
ENTRYPOINT ["java", "-jar", "app.jar"]
