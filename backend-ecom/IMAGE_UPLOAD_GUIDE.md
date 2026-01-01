# Guide d'Upload d'Images - Shopie Backend

## Nouvelles Fonctionnalités

### 1. Upload d'Images pour les Produits

L'admin peut maintenant ajouter des images aux produits de 3 façons :

#### A. Upload depuis la galerie
- Sélectionner une image depuis la galerie du téléphone
- L'image est automatiquement uploadée sur le serveur
- Redimensionnement automatique et optimisation

#### B. Prise de photo avec la caméra
- Prendre une photo directement avec la caméra
- L'image est automatiquement uploadée sur le serveur

#### C. URL d'image externe (méthode existante)
- Saisir l'URL d'une image hébergée ailleurs
- Compatible avec les images existantes

### 2. Endpoints API Ajoutés

#### POST /api/images/upload
- **Rôle requis** : ADMIN
- **Content-Type** : multipart/form-data
- **Paramètre** : file (image)
- **Formats supportés** : JPG, PNG, GIF, WEBP
- **Taille max** : 10MB
- **Retour** : { imageUrl, filename, originalName }

#### GET /api/images/{filename}
- **Accès** : Public
- **Retour** : Fichier image
- **Headers** : Content-Type approprié

#### DELETE /api/images/{filename}
- **Rôle requis** : ADMIN
- **Retour** : Message de confirmation

### 3. Configuration

#### Backend (application.properties)
```properties
# File Upload Configuration
spring.servlet.multipart.enabled=true
spring.servlet.multipart.max-file-size=10MB
spring.servlet.multipart.max-request-size=10MB
app.upload.dir=uploads/images
```

#### Frontend
- Installation requise : `expo-image-picker`
- Permissions : Caméra et galerie

### 4. Structure des Fichiers

```
backend-ecom/
├── uploads/
│   └── images/
│       ├── uuid1.jpg
│       ├── uuid2.png
│       └── ...
└── src/main/java/.../controller/
    └── ImageController.java
```

### 5. Utilisation

#### Pour l'Admin :
1. Aller dans "Gestion des Produits"
2. Créer ou modifier un produit
3. Cliquer sur "Ajouter image"
4. Choisir : Galerie, Caméra, ou URL
5. L'image est automatiquement associée au produit

#### Affichage :
- Les images uploadées sont automatiquement affichées
- Fallback vers placeholder si pas d'image
- Support des URLs externes existantes

### 6. Sécurité

- Upload limité aux admins uniquement
- Validation du type de fichier (images seulement)
- Noms de fichiers uniques (UUID)
- Taille limitée à 10MB
- Répertoire d'upload sécurisé

### 7. Installation

#### Backend :
```bash
# Créer le répertoire d'upload
mkdir uploads\images

# Redémarrer le serveur Spring Boot
mvn spring-boot:run
```

#### Frontend :
```bash
# Installer expo-image-picker
npm install expo-image-picker

# Redémarrer Expo
expo start
```

### 8. Dépannage

#### Erreur "Permission denied" :
- Vérifier les permissions de caméra/galerie
- Redémarrer l'app Expo

#### Erreur d'upload :
- Vérifier que le répertoire uploads/images existe
- Vérifier les permissions du serveur
- Vérifier la taille du fichier (< 10MB)

#### Images ne s'affichent pas :
- Vérifier l'URL de base dans la config
- Vérifier que le serveur backend est accessible
- Vérifier les CORS si nécessaire