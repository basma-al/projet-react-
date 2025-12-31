-- Script SQL pour créer la base de données Shopie
-- Exécuter ce script dans MySQL pour créer toutes les tables nécessaires

-- Créer la base de données
CREATE DATABASE IF NOT EXISTS shopie_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE shopie_db;

-- Table des utilisateurs
CREATE TABLE IF NOT EXISTS users (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    nom VARCHAR(50) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    mot_de_passe VARCHAR(255) NOT NULL,
    role ENUM('USER', 'ADMIN') NOT NULL DEFAULT 'USER',
    INDEX idx_email (email)
);

-- Table des produits
CREATE TABLE IF NOT EXISTS products (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    nom VARCHAR(255) NOT NULL,
    description TEXT,
    prix DECIMAL(10,2) NOT NULL,
    image_url VARCHAR(500),
    stock INT NOT NULL DEFAULT 0,
    INDEX idx_nom (nom),
    INDEX idx_stock (stock)
);

-- Table des articles du panier
CREATE TABLE IF NOT EXISTS cart_items (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT NOT NULL,
    product_id BIGINT NOT NULL,
    quantite INT NOT NULL,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE,
    UNIQUE KEY unique_user_product (user_id, product_id)
);

-- Table des commandes
CREATE TABLE IF NOT EXISTS orders (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT NOT NULL,
    total DECIMAL(10,2) NOT NULL,
    date DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    statut ENUM('PENDING', 'PAID', 'SHIPPED', 'DELIVERED') NOT NULL DEFAULT 'PENDING',
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_user_date (user_id, date),
    INDEX idx_statut (statut)
);

-- Table des articles de commande
CREATE TABLE IF NOT EXISTS order_items (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    order_id BIGINT NOT NULL,
    product_id BIGINT NOT NULL,
    quantite INT NOT NULL,
    prix DECIMAL(10,2) NOT NULL,
    FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE,
    FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE
);

-- Table des paiements
CREATE TABLE IF NOT EXISTS payments (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    order_id BIGINT NOT NULL UNIQUE,
    montant DECIMAL(10,2) NOT NULL,
    methode VARCHAR(50) NOT NULL,
    date DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    statut ENUM('PENDING', 'PAID', 'FAILED') NOT NULL DEFAULT 'PENDING',
    FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE,
    INDEX idx_statut (statut),
    INDEX idx_date (date)
);

-- Insérer un utilisateur admin par défaut
INSERT INTO users (nom, email, mot_de_passe, role) VALUES 
('Admin', 'admin@shopie.com', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'ADMIN')
ON DUPLICATE KEY UPDATE nom = nom;
-- Mot de passe par défaut: "password"

-- Insérer quelques produits d'exemple
INSERT INTO products (nom, description, prix, image_url, stock) VALUES 
('iPhone 15', 'Dernier smartphone Apple avec puce A17 Pro', 999.99, 'https://example.com/iphone15.jpg', 50),
('MacBook Pro', 'Ordinateur portable professionnel Apple', 1999.99, 'https://example.com/macbook.jpg', 25),
('AirPods Pro', 'Écouteurs sans fil avec réduction de bruit', 249.99, 'https://example.com/airpods.jpg', 100),
('iPad Air', 'Tablette Apple légère et puissante', 599.99, 'https://example.com/ipad.jpg', 75),
('Apple Watch', 'Montre connectée Apple Series 9', 399.99, 'https://example.com/watch.jpg', 60)
ON DUPLICATE KEY UPDATE nom = nom;

COMMIT;