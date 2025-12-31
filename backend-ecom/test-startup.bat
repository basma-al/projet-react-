@echo off
echo Test de demarrage rapide du backend Shopie...
echo.
echo ATTENTION: Ce test necessite MySQL en cours d'execution
echo avec la base de donnees 'shopie_db' creee.
echo.
echo Appuyez sur Ctrl+C pour arreter le test.
echo.
pause

echo Demarrage de l'application...
timeout /t 3 /nobreak > nul

java -jar target/shopie-backend-1.0.0.jar --spring.profiles.active=dev --server.port=8080

echo.
echo Test termine. L'application devrait etre accessible sur:
echo http://localhost:8080/api/swagger-ui.html
pause