# Multi-stage build for the DevLeap backend.
# Stage 1: Build the fat JAR with Maven.
# Stage 2: Run the JAR on a minimal JRE image.

# ---- Build stage ----
FROM eclipse-temurin:21-jdk-alpine AS build

WORKDIR /workspace

# Cache Maven dependencies before copying source
COPY pom.xml .
RUN mvn -B dependency:go-offline -q 2>/dev/null || true

COPY src ./src
RUN mvn -B package -DskipTests -q

# ---- Runtime stage ----
FROM eclipse-temurin:21-jre-alpine AS runtime

# Non-root user for security
RUN addgroup -S devlearn && adduser -S devlearn -G devlearn
USER devlearn

WORKDIR /app

COPY --from=build /workspace/target/devlearn-backend-*.jar app.jar

# Port is provided by the platform (Render sets $PORT)
EXPOSE 8080

ENTRYPOINT ["java", "-jar", "app.jar"]
