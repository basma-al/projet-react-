# 🚀 Guide de Démarrage Rapide - Shopie Backend

## ⚡ Démarrage en 5 minutes

### 1. Prérequis
- ☑️ Java 21+
- ☑️ Maven 3.6+
- ☑️ MySQL 8.0+

### 2. Configuration MySQL
```sql
-- Créer la base de données
CREATE DATABASE shopie_db;

-- Exécuter le script fourni
mysql -u root -p shopie_db < database-setup.sql
```

### 3. Lancement
```bash
# Windows
run.bat

# Linux/Mac
chmod +x run.sh
./run.sh

# Ou directement avec Maven
mvn spring-boot:run
```

### 4. Test rapide
- 🌐 API: http://localhost:8080/api
- 📚 Swagger: http://localhost:8080/api/swagger-ui.html

### 5. Comptes de test
- **Admin**: `admin@shopie.com` / `password`

## 🐳 Avec Docker (Recommandé)

```bash
# Construire et lancer
docker-compose up -d

# Vérifier les logs
docker-compose logs -f shopie-backend
```

## 📱 Test avec React Native

### Inscription
```javascript
const response = await fetch('http://localhost:8080/api/auth/register', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    nom: 'John Doe',
    email: 'john@example.com',
    motDePasse: 'password123'
  })
});
```

### Récupérer les produits
```javascript
const products = await fetch('http://localhost:8080/api/products');
const data = await products.json();
```

### Ajouter au panier (avec token)
```javascript
const response = await fetch('http://localhost:8080/api/cart', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`
  },
  body: JSON.stringify({
    productId: 1,
    quantite: 2
  })
});
```

## 🔧 Variables d'environnement

Créer un fichier `.env` :
```bash
DB_USERNAME=root
DB_PASSWORD=password
JWT_SECRET=mySecretKey123456789012345678901234567890
PORT=8080
```

## 📊 Endpoints principaux

| Méthode | Endpoint | Description |
|---------|----------|-------------|
| POST | `/auth/register` | Inscription |
| POST | `/auth/login` | Connexion |
| GET | `/products` | Liste produits |
| POST | `/cart` | Ajouter au panier |
| POST | `/orders` | Créer commande |
| POST | `/payments` | Créer paiement |

## 🛠️ Résolution des problèmes

### Erreur de connexion MySQL
```bash
# Vérifier que MySQL est démarré
sudo systemctl status mysql

# Vérifier les credentials
mysql -u root -p
```

### Port 8080 occupé
```bash
# Changer le port
export PORT=8081
mvn spring-boot:run
```

### Erreur JWT
Vérifier que `JWT_SECRET` est défini et fait au moins 32 caractères.

## 🎯 Prêt pour la production !

L'application est configurée avec :
- ✅ Sécurité JWT
- ✅ Validation des données
- ✅ Gestion d'erreurs
- ✅ Documentation Swagger
- ✅ Docker ready
- ✅ Profils Spring (dev/prod)
- ✅ Tests unitaires
- ✅ CORS configuré pour React Native

**Bon développement ! 🚀**