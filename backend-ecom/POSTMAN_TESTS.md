# 🧪 Tests Postman - Backend Shopie

## 🚀 **Étapes de Préparation**

### 1. **Démarrer le Backend**
```bash
# Option 1 : Avec Maven
mvn spring-boot:run

# Option 2 : Avec le JAR
java -jar target/shopie-backend-1.0.0.jar

# Option 3 : Avec Docker
docker-compose up -d
```

### 2. **Vérifier que l'API fonctionne**
- URL de base : `http://localhost:8080/api`
- Swagger UI : `http://localhost:8080/api/swagger-ui.html`

---

## 📋 **Collection Postman - Tests Étape par Étape**

### **🔧 Configuration Postman**

#### Variables d'environnement à créer :
- `baseUrl` = `http://localhost:8080/api`
- `token` = (sera rempli automatiquement)
- `userId` = (sera rempli automatiquement)

---

## **1️⃣ AUTHENTIFICATION**

### **Test 1 : Inscription d'un utilisateur**
```
POST {{baseUrl}}/auth/register
Content-Type: application/json

{
  "nom": "John Doe",
  "email": "john@example.com",
  "motDePasse": "password123"
}
```

**Résultat attendu :**
```json
{
  "token": "eyJhbGciOiJIUzI1NiJ9...",
  "type": "Bearer",
  "id": 2,
  "nom": "John Doe",
  "email": "john@example.com",
  "role": "USER"
}
```

**Script Post-request :**
```javascript
if (pm.response.code === 200) {
    const response = pm.response.json();
    pm.environment.set("token", response.token);
    pm.environment.set("userId", response.id);
}
```

### **Test 2 : Connexion utilisateur**
```
POST {{baseUrl}}/auth/login
Content-Type: application/json

{
  "email": "john@example.com",
  "motDePasse": "password123"
}
```

### **Test 3 : Connexion Admin**
```
POST {{baseUrl}}/auth/login
Content-Type: application/json

{
  "email": "admin@shopie.com",
  "motDePasse": "password"
}
```

---

## **2️⃣ GESTION DES PRODUITS**

### **Test 4 : Lister tous les produits (Public)**
```
GET {{baseUrl}}/products
```

### **Test 5 : Récupérer un produit spécifique**
```
GET {{baseUrl}}/products/1
```

### **Test 6 : Rechercher des produits**
```
GET {{baseUrl}}/products/search?nom=iPhone
```

### **Test 7 : Créer un produit (Admin uniquement)**
```
POST {{baseUrl}}/products
Authorization: Bearer {{token}}
Content-Type: application/json

{
  "nom": "Samsung Galaxy S24",
  "description": "Dernier smartphone Samsung avec IA",
  "prix": 899.99,
  "imageUrl": "https://example.com/galaxy.jpg",
  "stock": 30
}
```

### **Test 8 : Modifier un produit (Admin)**
```
PUT {{baseUrl}}/products/1
Authorization: Bearer {{token}}
Content-Type: application/json

{
  "nom": "iPhone 15 Pro Max",
  "description": "iPhone 15 Pro Max avec puce A17 Pro",
  "prix": 1199.99,
  "imageUrl": "https://example.com/iphone15pro.jpg",
  "stock": 25
}
```

---

## **3️⃣ GESTION DU PANIER**

### **Test 9 : Voir le panier (vide au début)**
```
GET {{baseUrl}}/cart
Authorization: Bearer {{token}}
```

### **Test 10 : Ajouter un produit au panier**
```
POST {{baseUrl}}/cart
Authorization: Bearer {{token}}
Content-Type: application/json

{
  "productId": 1,
  "quantite": 2
}
```

### **Test 11 : Ajouter un autre produit**
```
POST {{baseUrl}}/cart
Authorization: Bearer {{token}}
Content-Type: application/json

{
  "productId": 2,
  "quantite": 1
}
```

### **Test 12 : Modifier la quantité dans le panier**
```
PUT {{baseUrl}}/cart/1?quantite=3
Authorization: Bearer {{token}}
```

### **Test 13 : Voir le panier mis à jour**
```
GET {{baseUrl}}/cart
Authorization: Bearer {{token}}
```

---

## **4️⃣ GESTION DES COMMANDES**

### **Test 14 : Créer une commande depuis le panier**
```
POST {{baseUrl}}/orders
Authorization: Bearer {{token}}
```

**Script Post-request :**
```javascript
if (pm.response.code === 200) {
    const response = pm.response.json();
    pm.environment.set("orderId", response.id);
}
```

### **Test 15 : Voir mes commandes**
```
GET {{baseUrl}}/orders
Authorization: Bearer {{token}}
```

### **Test 16 : Voir les détails d'une commande**
```
GET {{baseUrl}}/orders/{{orderId}}
Authorization: Bearer {{token}}
```

---

## **5️⃣ GESTION DES PAIEMENTS**

### **Test 17 : Créer un paiement**
```
POST {{baseUrl}}/payments
Authorization: Bearer {{token}}
Content-Type: application/json

{
  "orderId": {{orderId}},
  "montant": 2999.97,
  "methode": "Stripe"
}
```

**Script Post-request :**
```javascript
if (pm.response.code === 200) {
    const response = pm.response.json();
    pm.environment.set("paymentId", response.id);
}
```

### **Test 18 : Traiter le paiement**
```
POST {{baseUrl}}/payments/{{paymentId}}/process
Authorization: Bearer {{token}}
```

---

## **6️⃣ FONCTIONS ADMIN**

### **Test 19 : Voir toutes les commandes (Admin)**
```
GET {{baseUrl}}/orders/admin/all
Authorization: Bearer {{token}}
```

### **Test 20 : Modifier le statut d'une commande**
```
PUT {{baseUrl}}/orders/admin/{{orderId}}/status?statut=SHIPPED
Authorization: Bearer {{token}}
```

### **Test 21 : Voir tous les paiements (Admin)**
```
GET {{baseUrl}}/payments/admin/all
Authorization: Bearer {{token}}
```

### **Test 22 : Modifier le statut d'un paiement**
```
PUT {{baseUrl}}/payments/admin/{{paymentId}}/status?statut=PAID
Authorization: Bearer {{token}}
```

---

## **7️⃣ TESTS D'ERREUR**

### **Test 23 : Tentative d'accès sans token**
```
GET {{baseUrl}}/cart
```
**Résultat attendu :** 401 Unauthorized

### **Test 24 : Token invalide**
```
GET {{baseUrl}}/cart
Authorization: Bearer invalid_token_here
```

### **Test 25 : Accès admin avec compte utilisateur**
```
GET {{baseUrl}}/orders/admin/all
Authorization: Bearer {{token}}
```
**Résultat attendu :** 403 Forbidden (si connecté en tant qu'utilisateur)

### **Test 26 : Données invalides**
```
POST {{baseUrl}}/auth/register
Content-Type: application/json

{
  "nom": "",
  "email": "email-invalide",
  "motDePasse": "123"
}
```

---

## **📊 Résultats Attendus par Test**

| Test | Endpoint | Status | Description |
|------|----------|--------|-------------|
| 1 | POST /auth/register | 200 | Inscription réussie + token |
| 2 | POST /auth/login | 200 | Connexion réussie + token |
| 3 | POST /auth/login | 200 | Connexion admin + token |
| 4 | GET /products | 200 | Liste des produits |
| 5 | GET /products/1 | 200 | Détails du produit |
| 6 | GET /products/search | 200 | Résultats de recherche |
| 7 | POST /products | 200 | Produit créé (admin) |
| 8 | PUT /products/1 | 200 | Produit modifié |
| 9 | GET /cart | 200 | Panier (vide) |
| 10 | POST /cart | 200 | Article ajouté |
| 11 | POST /cart | 200 | Autre article ajouté |
| 12 | PUT /cart/1 | 200 | Quantité modifiée |
| 13 | GET /cart | 200 | Panier avec articles |
| 14 | POST /orders | 200 | Commande créée |
| 15 | GET /orders | 200 | Liste des commandes |
| 16 | GET /orders/{id} | 200 | Détails commande |
| 17 | POST /payments | 200 | Paiement créé |
| 18 | POST /payments/{id}/process | 200 | Paiement traité |
| 19 | GET /orders/admin/all | 200 | Toutes les commandes |
| 20 | PUT /orders/admin/{id}/status | 200 | Statut modifié |
| 21 | GET /payments/admin/all | 200 | Tous les paiements |
| 22 | PUT /payments/admin/{id}/status | 200 | Statut paiement modifié |

---

## **🔧 Configuration Avancée Postman**

### **Variables d'environnement complètes :**
```json
{
  "baseUrl": "http://localhost:8080/api",
  "token": "",
  "userId": "",
  "orderId": "",
  "paymentId": "",
  "adminToken": ""
}
```

### **Scripts de test automatiques :**

**Pour tous les tests d'authentification :**
```javascript
pm.test("Status code is 200", function () {
    pm.response.to.have.status(200);
});

pm.test("Response has token", function () {
    const jsonData = pm.response.json();
    pm.expect(jsonData).to.have.property('token');
});
```

**Pour les tests de produits :**
```javascript
pm.test("Status code is 200", function () {
    pm.response.to.have.status(200);
});

pm.test("Response is array", function () {
    const jsonData = pm.response.json();
    pm.expect(jsonData).to.be.an('array');
});
```

---

## **🚨 Dépannage**

### **Problèmes courants :**

1. **Erreur 401 :** Token manquant ou expiré
2. **Erreur 403 :** Permissions insuffisantes (admin requis)
3. **Erreur 404 :** Endpoint ou ressource introuvable
4. **Erreur 400 :** Données de requête invalides
5. **Erreur 500 :** Problème serveur (vérifier les logs)

### **Vérifications :**
- ✅ Backend démarré sur le port 8080
- ✅ Base de données MySQL accessible
- ✅ Token JWT valide et non expiré
- ✅ Headers Content-Type corrects
- ✅ Format JSON valide

---

**🎉 Avec ces tests, vous pouvez valider complètement votre API Shopie !**