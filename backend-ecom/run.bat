@echo off
echo Demarrage de l'application Shopie Backend...
echo.
echo Configuration requise:
echo - Java 21 ou superieur
echo - MySQL 8.0+ en cours d'execution
echo - Base de donnees 'shopie_db' creee
echo.
echo Endpoints principaux:
echo - API: http://localhost:8080/api
echo - Swagger: http://localhost:8080/api/swagger-ui.html
echo.
echo Comptes de test:
echo - Admin: admin@shopie.com / password
echo.
pause
mvn spring-boot:run