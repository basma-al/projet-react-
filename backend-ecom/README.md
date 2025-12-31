# Shopie Backend - API E-commerce

Backend REST API pour l'application e-commerce **Shopie**, développé avec Spring Boot. Cette API est conçue pour être utilisée avec une application mobile React Native.

## 🚀 Fonctionnalités

### Authentification & Autorisation
- ✅ Inscription et connexion utilisateur
- ✅ Authentification JWT
- ✅ Gestion des rôles (USER/ADMIN)
- ✅ Protection des routes sensibles

### Gestion des Produits
- ✅ CRUD complet des produits (Admin)
- ✅ Consultation publique des produits
- ✅ Recherche de produits
- ✅ Gestion du stock

### Panier d'Achat
- ✅ Ajout/suppression d'articles
- ✅ Modification des quantités
- ✅ Vérification du stock en temps réel

### Commandes
- ✅ Création de commandes depuis le panier
- ✅ Suivi des commandes utilisateur
- ✅ Gestion des statuts (PENDING, PAID, SHIPPED, DELIVERED)
- ✅ Dashboard admin pour toutes les commandes

### Paiements
- ✅ Création et traitement des paiements
- ✅ Support multi-méthodes (Stripe, PayPal, etc.)
- ✅ Suivi des statuts de paiement
- ✅ Dashboard admin des paiements

## 🛠️ Technologies Utilisées

- **Java 21**
- **Spring Boot 4.0.1**
- **Spring Security** (JWT)
- **Spring Data JPA**
- **MySQL 8.0+**
- **Maven**
- **Swagger/OpenAPI 3**
- **Lombok**

## 📋 Prérequis

- Java 21 ou supérieur
- Maven 3.6+
- MySQL 8.0+
- Git

## 🔧 Installation et Configuration

### 1. Cloner le projet
```bash
git clone <repository-url>
cd backend-ecom
```

### 2. Configuration de la base de données

#### Créer la base de données MySQL
```bash
mysql -u root -p
```

Puis exécuter le script SQL fourni :
```bash
mysql -u root -p < database-setup.sql
```

#### Configurer les variables d'environnement (optionnel)
Créer un fichier `.env` ou définir les variables système :
```bash
export DB_USERNAME=root
export DB_PASSWORD=votre_mot_de_passe
export JWT_SECRET=votre_secret_jwt_tres_long_et_securise
export PORT=8080
```

### 3. Compilation et lancement

#### Avec Maven
```bash
# Compiler le projet
mvn clean compile

# Lancer l'application
mvn spring-boot:run
```

#### Avec le JAR
```bash
# Créer le JAR
mvn clean package

# Lancer le JAR
java -jar target/shopie-backend-1.0.0.jar
```

### 4. Vérification

L'API sera accessible sur : `http://localhost:8080/api`

Documentation Swagger : `http://localhost:8080/api/swagger-ui.html`

## 📚 Documentation API

### Endpoints principaux

#### Authentification
- `POST /api/auth/register` - Inscription
- `POST /api/auth/login` - Connexion

#### Produits
- `GET /api/products` - Liste des produits
- `GET /api/products/{id}` - Détails d'un produit
- `GET /api/products/search?nom=...` - Recherche
- `POST /api/products` - Créer un produit (Admin)
- `PUT /api/products/{id}` - Modifier un produit (Admin)
- `DELETE /api/products/{id}` - Supprimer un produit (Admin)

#### Panier
- `GET /api/cart` - Voir le panier
- `POST /api/cart` - Ajouter au panier
- `PUT /api/cart/{id}` - Modifier la quantité
- `DELETE /api/cart/{id}` - Supprimer un article
- `DELETE /api/cart` - Vider le panier

#### Commandes
- `GET /api/orders` - Mes commandes
- `POST /api/orders` - Créer une commande
- `GET /api/orders/{id}` - Détails d'une commande
- `GET /api/orders/admin/all` - Toutes les commandes (Admin)
- `PUT /api/orders/admin/{id}/status` - Modifier le statut (Admin)

#### Paiements
- `POST /api/payments` - Créer un paiement
- `POST /api/payments/{id}/process` - Traiter un paiement
- `GET /api/payments/admin/all` - Tous les paiements (Admin)
- `PUT /api/payments/admin/{id}/status` - Modifier le statut (Admin)

### Authentification JWT

Pour les endpoints protégés, inclure le header :
```
Authorization: Bearer <votre_token_jwt>
```

### Exemples de requêtes

#### Inscription
```json
POST /api/auth/register
{
  "nom": "John Doe",
  "email": "john@example.com",
  "motDePasse": "password123"
}
```

#### Connexion
```json
POST /api/auth/login
{
  "email": "john@example.com",
  "motDePasse": "password123"
}
```

#### Ajouter au panier
```json
POST /api/cart
{
  "productId": 1,
  "quantite": 2
}
```

## 🔐 Sécurité

- Mots de passe hashés avec BCrypt
- Tokens JWT avec expiration (24h par défaut)
- Protection CORS configurée
- Validation des données d'entrée
- Gestion des erreurs sécurisée

## 🗂️ Structure du Projet

```
src/main/java/com/shopie/backend/
├── config/          # Configuration Spring
├── controller/      # Contrôleurs REST
├── dto/            # Data Transfer Objects
├── exception/      # Gestion des exceptions
├── model/          # Entités JPA
├── repository/     # Repositories JPA
├── security/       # Configuration sécurité JWT
└── service/        # Logique métier
```

## 🧪 Tests

```bash
# Lancer tous les tests
mvn test

# Tests avec couverture
mvn test jacoco:report
```

## 🚀 Déploiement

### Variables d'environnement de production
```bash
DB_USERNAME=prod_user
DB_PASSWORD=secure_password
JWT_SECRET=very_long_and_secure_jwt_secret_key
PORT=8080
SPRING_PROFILES_ACTIVE=prod
```

### Docker (optionnel)
```dockerfile
FROM openjdk:21-jdk-slim
COPY target/shopie-backend-1.0.0.jar app.jar
EXPOSE 8080
ENTRYPOINT ["java","-jar","/app.jar"]
```

## 🤝 Intégration React Native

Cette API est conçue pour être utilisée avec React Native. Exemples d'intégration :

```javascript
// Configuration de base
const API_BASE_URL = 'http://localhost:8080/api';

// Authentification
const login = async (email, motDePasse) => {
  const response = await fetch(`${API_BASE_URL}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, motDePasse })
  });
  return response.json();
};

// Récupérer les produits
const getProducts = async () => {
  const response = await fetch(`${API_BASE_URL}/products`);
  return response.json();
};
```

## 📝 Comptes de Test

### Administrateur
- **Email**: `admin@shopie.com`
- **Mot de passe**: `password`

### Utilisateur de test
Créez un compte via l'endpoint `/api/auth/register`

## 🐛 Résolution des Problèmes

### Erreur de connexion à la base de données
1. Vérifiez que MySQL est démarré
2. Vérifiez les credentials dans `application.properties`
3. Assurez-vous que la base de données `shopie_db` existe

### Erreur JWT
1. Vérifiez que le secret JWT est défini
2. Vérifiez que le token n'est pas expiré
3. Vérifiez le format du header Authorization

### Port déjà utilisé
```bash
# Changer le port dans application.properties
server.port=8081
```

## 📞 Support

Pour toute question ou problème :
1. Vérifiez la documentation Swagger
2. Consultez les logs de l'application
3. Vérifiez la configuration de la base de données

## 📄 Licence

Ce projet est sous licence MIT. Voir le fichier `LICENSE` pour plus de détails.

---

**Shopie Backend** - Prêt pour la production et l'intégration mobile ! 🚀