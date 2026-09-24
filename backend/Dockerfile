# ---- Build stage ----
FROM eclipse-temurin:21-jdk-alpine AS build
WORKDIR /app

# Copiar Maven wrapper y pom.xml primero para cachear dependencias
COPY .mvn/ .mvn/
COPY mvnw pom.xml ./
RUN chmod +x mvnw && ./mvnw dependency:resolve -B

# Copiar el código fuente y construir
COPY src/ src/
RUN ./mvnw package -DskipTests -B

# ---- Runtime stage ----
FROM eclipse-temurin:21-jre-alpine
WORKDIR /app

# Crear directorio de uploads
RUN mkdir -p /app/uploads

# Copiar el JAR construido
COPY --from=build /app/target/*.jar app.jar

# Railway inyecta PORT como variable de entorno
ENV SERVER_PORT=8080
EXPOSE 8080

ENTRYPOINT ["java", "-jar", "app.jar"]
