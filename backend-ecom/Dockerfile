# Dockerfile pour Shopie Backend
FROM openjdk:21-jdk-slim

# Métadonnées
LABEL maintainer="Shopie Team"
LABEL description="Backend API pour l'application e-commerce Shopie"
LABEL version="1.0.0"

# Variables d'environnement
ENV SPRING_PROFILES_ACTIVE=prod
ENV SERVER_PORT=8080

# Créer un utilisateur non-root
RUN groupadd -r shopie && useradd -r -g shopie shopie

# Répertoire de travail
WORKDIR /app

# Copier le JAR de l'application
COPY target/shopie-backend-1.0.0.jar app.jar

# Changer le propriétaire
RUN chown shopie:shopie app.jar

# Utiliser l'utilisateur non-root
USER shopie

# Exposer le port
EXPOSE 8080

# Point d'entrée
ENTRYPOINT ["java", "-jar", "/app/app.jar"]

# Healthcheck
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD curl -f http://localhost:8080/api/products || exit 1