# 🚀 Démarrage Rapide - Shopie Mobile

Guide de démarrage en 5 minutes pour tester l'application Shopie sur Android.

## ⚡ Étapes Rapides

### 1. **Prérequis** (2 minutes)
```bash
# Vérifier Node.js
node --version  # Doit être 18+

# Installer Expo CLI si nécessaire
npm install -g @expo/cli

# Installer Expo Go sur votre téléphone Android
# Play Store: "Expo Go"
```

### 2. **Installation** (1 minute)
```bash
cd shopie-mobile
npm install
```

### 3. **Configuration Backend** (30 secondes)
Assurez-vous que votre backend Shopie fonctionne :
```bash
# Dans le dossier backend-ecom
mvn spring-boot:run
# ou
./run.bat  # Windows
./run.sh   # Linux/Mac
```

L'API doit être accessible sur : `http://localhost:8081/api`

### 4. **Démarrage** (30 secondes)
```bash
npm start
# ou
expo start
```

### 5. **Test sur Android** (1 minute)
1. **Ouvrez Expo Go** sur votre téléphone
2. **Scannez le QR code** affiché dans le terminal
3. **L'app se lance** automatiquement !

## 🎯 Test Rapide

### Connexion Admin (Test)
1. Appuyez sur **"Connexion Admin (Test)"**
2. L'app se connecte automatiquement avec `admin@shopie.com`

### Parcours Utilisateur
1. **Accueil** → Voir les produits
2. **Recherche** → Tapez "iPhone"
3. **Détail** → Cliquez sur un produit
4. **Panier** → Ajoutez au panier
5. **Commande** → Passez une commande test

## 🔧 Configuration Réseau

### Émulateur Android
```javascript
// src/config/api.js
BASE_URL: 'http://10.0.2.2:8081/api'  // ✅ Déjà configuré
```

### Appareil Physique
Si vous testez sur un vrai téléphone :

1. **Trouvez votre IP** :
   ```bash
   # Windows
   ipconfig
   
   # Mac/Linux  
   ifconfig
   ```

2. **Modifiez l'API** :
   ```javascript
   // src/config/api.js
   BASE_URL: 'http://VOTRE_IP:8081/api'  // Remplacez VOTRE_IP
   ```

3. **Redémarrez** :
   ```bash
   expo start --clear
   ```

## 🐛 Problèmes Courants

### "Impossible de se connecter"
```bash
# 1. Vérifier le backend
curl http://localhost:8081/api/products

# 2. Vérifier l'IP (appareil physique)
ping VOTRE_IP

# 3. Redémarrer Expo
expo start --clear
```

### "Module non trouvé"
```bash
# Réinstaller les dépendances
rm -rf node_modules
npm install
```

### "Expo CLI obsolète"
```bash
# Mettre à jour
npm install -g @expo/cli@latest
```

## 📱 Comptes de Test

| Type | Email | Mot de passe |
|------|-------|--------------|
| **Admin** | `admin@shopie.com` | `password` |
| **Utilisateur** | Créer via inscription | - |

## 🎯 Fonctionnalités à Tester

- ✅ **Connexion** admin rapide
- ✅ **Navigation** entre les onglets
- ✅ **Recherche** de produits
- ✅ **Ajout** au panier
- ✅ **Commande** complète
- ✅ **Historique** des commandes

## 📊 Endpoints Testés

L'application teste automatiquement :
- `GET /api/products` - Liste des produits
- `POST /api/auth/login` - Connexion
- `POST /api/cart` - Ajout au panier
- `POST /api/orders` - Création commande
- `POST /api/payments` - Paiement

## 🚀 Prêt !

En moins de 5 minutes, vous devriez avoir :
- ✅ Application lancée sur Android
- ✅ Connexion au backend réussie
- ✅ Navigation fonctionnelle
- ✅ Commande test passée

---

**🎉 Shopie Mobile fonctionne ! Bon test ! 📱**