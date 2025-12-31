import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';

export default function ProductCard({ product, onPress }) {
  const { user } = useAuth();
  const { 
    addToCart, 
    isProductInCart, 
    getProductQuantityInCart, 
    removeProductFromCart,
    updateCartItem 
  } = useCart();

  const isInCart = isProductInCart(product.id);
  const quantityInCart = getProductQuantityInCart(product.id);
  const isAdmin = user?.role === 'ADMIN';

  const handleAddToCart = async () => {
    const result = await addToCart(product.id, 1);
    if (result.success) {
      Alert.alert('Succès', 'Produit ajouté au panier');
    } else {
      Alert.alert('Erreur', result.error || 'Impossible d\'ajouter au panier');
    }
  };

  const handleRemoveFromCart = async () => {
    const result = await removeProductFromCart(product.id);
    if (result.success) {
      Alert.alert('Succès', 'Produit retiré du panier');
    } else {
      Alert.alert('Erreur', result.error || 'Impossible de retirer du panier');
    }
  };

  const handleUpdateQuantity = async (newQuantity) => {
    if (newQuantity <= 0) {
      handleRemoveFromCart();
      return;
    }

    const cartItem = isProductInCart(product.id);
    if (cartItem) {
      const result = await updateCartItem(cartItem.id, newQuantity);
      if (!result.success) {
        Alert.alert('Erreur', result.error || 'Impossible de modifier la quantité');
      }
    }
  };

  return (
    <TouchableOpacity style={styles.productCard} onPress={onPress}>
      <Image
        source={{ 
          uri: product.imageUrl || 'https://via.placeholder.com/150x150?text=No+Image' 
        }}
        style={styles.productImage}
        defaultSource={{ uri: 'https://via.placeholder.com/150x150?text=No+Image' }}
      />
      
      {/* Badge pour indiquer si le produit est dans le panier */}
      {isInCart && !isAdmin && (
        <View style={styles.cartBadge}>
          <Text style={styles.cartBadgeText}>{quantityInCart}</Text>
        </View>
      )}

      <View style={styles.productInfo}>
        <Text style={styles.productName} numberOfLines={2}>
          {product.nom}
        </Text>
        <Text style={styles.productDescription} numberOfLines={2}>
          {product.description}
        </Text>
        <View style={styles.productFooter}>
          <Text style={styles.productPrice}>
            {product.prix?.toFixed(2)} €
          </Text>
          
          {/* Boutons d'action selon le rôle et l'état du panier */}
          {!isAdmin && (
            <View style={styles.cartActions}>
              {isInCart ? (
                <View style={styles.quantityControls}>
                  <TouchableOpacity
                    style={styles.quantityButton}
                    onPress={() => handleUpdateQuantity(quantityInCart - 1)}
                  >
                    <Ionicons name="remove" size={16} color="white" />
                  </TouchableOpacity>
                  <Text style={styles.quantityText}>{quantityInCart}</Text>
                  <TouchableOpacity
                    style={styles.quantityButton}
                    onPress={() => handleUpdateQuantity(quantityInCart + 1)}
                  >
                    <Ionicons name="add" size={16} color="white" />
                  </TouchableOpacity>
                </View>
              ) : (
                <TouchableOpacity
                  style={[styles.addButton, product.stock === 0 && styles.disabledButton]}
                  onPress={handleAddToCart}
                  disabled={product.stock === 0}
                >
                  <Ionicons name="add" size={20} color="white" />
                </TouchableOpacity>
              )}
            </View>
          )}
        </View>
        
        <View style={styles.stockContainer}>
          <Text style={[
            styles.stockText,
            product.stock === 0 && styles.outOfStock,
            product.stock < 10 && product.stock > 0 && styles.lowStock
          ]}>
            {product.stock === 0 ? 'Rupture de stock' : `Stock: ${product.stock}`}
          </Text>
          {isInCart && !isAdmin && (
            <TouchableOpacity
              style={styles.removeButton}
              onPress={handleRemoveFromCart}
            >
              <Ionicons name="trash-outline" size={14} color="#ef4444" />
              <Text style={styles.removeButtonText}>Retirer</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  productCard: {
    flex: 1,
    backgroundColor: 'white',
    margin: 5,
    borderRadius: 10,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 3,
    position: 'relative',
  },
  cartBadge: {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: '#ef4444',
    borderRadius: 12,
    width: 24,
    height: 24,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1,
  },
  cartBadgeText: {
    color: 'white',
    fontSize: 12,
    fontWeight: 'bold',
  },
  productImage: {
    width: '100%',
    height: 120,
    borderTopLeftRadius: 10,
    borderTopRightRadius: 10,
    resizeMode: 'cover',
  },
  productInfo: {
    padding: 10,
  },
  productName: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  productDescription: {
    fontSize: 12,
    color: '#666',
    marginBottom: 10,
  },
  productFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 5,
  },
  productPrice: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#6366f1',
  },
  cartActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  addButton: {
    backgroundColor: '#6366f1',
    borderRadius: 15,
    width: 30,
    height: 30,
    justifyContent: 'center',
    alignItems: 'center',
  },
  disabledButton: {
    backgroundColor: '#ccc',
  },
  quantityControls: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f0f0f0',
    borderRadius: 15,
    paddingHorizontal: 4,
  },
  quantityButton: {
    backgroundColor: '#6366f1',
    borderRadius: 12,
    width: 24,
    height: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  quantityText: {
    fontSize: 14,
    fontWeight: 'bold',
    marginHorizontal: 8,
    minWidth: 20,
    textAlign: 'center',
  },
  stockContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  stockText: {
    fontSize: 12,
    color: '#666',
  },
  outOfStock: {
    color: '#ef4444',
    fontWeight: 'bold',
  },
  lowStock: {
    color: '#f59e0b',
    fontWeight: '600',
  },
  removeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 4,
    paddingVertical: 2,
  },
  removeButtonText: {
    fontSize: 10,
    color: '#ef4444',
    marginLeft: 2,
  },
});