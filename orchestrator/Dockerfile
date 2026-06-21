FROM eclipse-temurin:17-jdk-alpine
WORKDIR /app
COPY target/orchestrator-0.0.1-SNAPSHOT.jar app.jar
EXPOSE 8080
RUN adduser -D appuser
USER appuser
ENTRYPOINT ["java", "-jar", "app.jar"]