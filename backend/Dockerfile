# ---- Build stage ----
FROM eclipse-temurin:21-jdk-alpine AS build

WORKDIR /workspace

# Copy Maven wrapper and POM first to cache dependencies
COPY .mvn .mvn
COPY mvnw .
COPY pom.xml .

RUN chmod +x mvnw && ./mvnw -B dependency:go-offline -q 2>/dev/null || true

# Copy source and build
COPY src ./src
RUN ./mvnw -B package -Dmaven.test.skip=true -q

# ---- Runtime stage ----
FROM eclipse-temurin:21-jre-alpine AS runtime

# Non-root user for security
RUN addgroup -S devlearn && adduser -S devlearn -G devlearn
USER devlearn

WORKDIR /app

COPY --from=build /workspace/target/devlearn-backend-*.jar app.jar

# Render injects PORT at runtime; Spring Boot reads it via ${PORT:8080}
EXPOSE 8080

ENTRYPOINT ["java", "-jar", "app.jar"]
