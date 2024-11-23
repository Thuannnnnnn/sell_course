# Use official OpenJDK image
FROM openjdk:17-jdk-slim

# Set work directory
WORKDIR /app

# Copy Maven Wrapper and its configuration
COPY .mvn /app/.mvn
COPY mvnw /app/mvnw

# Copy pom.xml for dependency resolution
COPY pom.xml /app/

# Resolve Maven dependencies
RUN ./mvnw dependency:go-offline

# Copy the application source code
COPY src /app/src

# Expose port
EXPOSE 8080

# Command to run the application
CMD ["./mvnw", "spring-boot:run"]
