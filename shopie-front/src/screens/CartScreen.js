import React, { useEffect } from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  TouchableOpacity,
  Image,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useCart } from '../context/CartContext';

export default function CartScreen({ navigation }) {
  const { 
    cartItems, 
    loading, 
    updateCartItem, 
    removeFromCart, 
    clearCart, 
    getCartTotal,
    loadCart 
  } = useCart();

  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', () => {
      loadCart();
    });
    return unsubscribe;
  }, [navigation]);

  const handleUpdateQuantity = async (cartItemId, newQuantity) => {
    if (newQuantity <= 0) {
      handleRemoveItem(cartItemId);
      return;
    }

    const result = await updateCartItem(cartItemId, newQuantity);
    if (!result.success) {
      Alert.alert('Erreur', result.error || 'Impossible de modifier la quantité');
    }
  };

  const handleRemoveItem = async (cartItemId) => {
    Alert.alert(
      'Supprimer l\'article',
      'Êtes-vous sûr de vouloir supprimer cet article du panier ?',
      [
        { text: 'Annuler', style: 'cancel' },
        {
          text: 'Supprimer',
          style: 'destructive',
          onPress: async () => {
            const result = await removeFromCart(cartItemId);
            if (!result.success) {
              Alert.alert('Erreur', result.error || 'Impossible de supprimer l\'article');
            }
          },
        },
      ]
    );
  };

  const handleClearCart = async () => {
    Alert.alert(
      'Vider le panier',
      'Êtes-vous sûr de vouloir vider complètement le panier ?',
      [
        { text: 'Annuler', style: 'cancel' },
        {
          text: 'Vider',
          style: 'destructive',
          onPress: async () => {
            const result = await clearCart();
            if (!result.success) {
              Alert.alert('Erreur', result.error || 'Impossible de vider le panier');
            }
          },
        },
      ]
    );
  };

  const handleCheckout = () => {
    if (cartItems.length === 0) {
      Alert.alert('Panier vide', 'Ajoutez des produits avant de passer commande');
      return;
    }
    navigation.navigate('Checkout');
  };

  const renderCartItem = ({ item }) => (
    <View style={styles.cartItem}>
      <Image
        source={{ 
          uri: item.product?.imageUrl || 'https://via.placeholder.com/80x80?text=No+Image' 
        }}
        style={styles.productImage}
        defaultSource={{ uri: 'https://via.placeholder.com/80x80?text=No+Image' }}
      />
      
      <View style={styles.productInfo}>
        <Text style={styles.productName} numberOfLines={2}>
          {item.product?.nom || 'Produit inconnu'}
        </Text>
        <Text style={styles.productPrice}>
          {item.product?.prix?.toFixed(2)} € / unité
        </Text>
        <Text style={styles.totalPrice}>
          Total: {((item.product?.prix || 0) * item.quantite).toFixed(2)} €
        </Text>
      </View>

      <View style={styles.quantityControls}>
        <TouchableOpacity
          style={styles.quantityButton}
          onPress={() => handleUpdateQuantity(item.id, item.quantite - 1)}
        >
          <Ionicons name="remove" size={16} color="#6366f1" />
        </TouchableOpacity>
        
        <Text style={styles.quantityText}>{item.quantite}</Text>
        
        <TouchableOpacity
          style={styles.quantityButton}
          onPress={() => handleUpdateQuantity(item.id, item.quantite + 1)}
        >
          <Ionicons name="add" size={16} color="#6366f1" />
        </TouchableOpacity>
      </View>

      <TouchableOpacity
        style={styles.removeButton}
        onPress={() => handleRemoveItem(item.id)}
      >
        <Ionicons name="trash-outline" size={20} color="#ef4444" />
      </TouchableOpacity>
    </View>
  );

  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <Text>Chargement du panier...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Mon Panier</Text>
        {cartItems.length > 0 && (
          <TouchableOpacity onPress={handleClearCart}>
            <Text style={styles.clearButton}>Vider</Text>
          </TouchableOpacity>
        )}
      </View>

      {cartItems.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Ionicons name="cart-outline" size={64} color="#ccc" />
          <Text style={styles.emptyText}>Votre panier est vide</Text>
          <TouchableOpacity
            style={styles.shopButton}
            onPress={() => navigation.navigate('Accueil')}
          >
            <Text style={styles.shopButtonText}>Commencer mes achats</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <>
          <FlatList
            data={cartItems}
            renderItem={renderCartItem}
            keyExtractor={(item) => item.id.toString()}
            style={styles.cartList}
          />

          <View style={styles.footer}>
            <View style={styles.totalContainer}>
              <Text style={styles.totalLabel}>Total:</Text>
              <Text style={styles.totalAmount}>
                {getCartTotal().toFixed(2)} €
              </Text>
            </View>
            
            <TouchableOpacity
              style={styles.checkoutButton}
              onPress={handleCheckout}
            >
              <Ionicons name="card" size={20} color="white" style={styles.buttonIcon} />
              <Text style={styles.checkoutButtonText}>
                Passer commande
              </Text>
            </TouchableOpacity>
          </View>
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    backgroundColor: 'white',
    paddingTop: 50,
    paddingHorizontal: 20,
    paddingBottom: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#6366f1',
  },
  clearButton: {
    color: '#ef4444',
    fontSize: 16,
    fontWeight: '600',
  },
  cartList: {
    flex: 1,
    padding: 10,
  },
  cartItem: {
    backgroundColor: 'white',
    borderRadius: 10,
    padding: 15,
    marginBottom: 10,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 3,
  },
  productImage: {
    width: 60,
    height: 60,
    borderRadius: 8,
    marginRight: 15,
  },
  productInfo: {
    flex: 1,
  },
  productName: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  productPrice: {
    fontSize: 14,
    color: '#666',
    marginBottom: 2,
  },
  totalPrice: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#6366f1',
  },
  quantityControls: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 10,
  },
  quantityButton: {
    width: 30,
    height: 30,
    borderRadius: 15,
    borderWidth: 1,
    borderColor: '#6366f1',
    justifyContent: 'center',
    alignItems: 'center',
  },
  quantityText: {
    fontSize: 16,
    fontWeight: 'bold',
    marginHorizontal: 15,
    minWidth: 20,
    textAlign: 'center',
  },
  removeButton: {
    padding: 5,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  emptyText: {
    fontSize: 18,
    color: '#666',
    marginTop: 20,
    marginBottom: 30,
    textAlign: 'center',
  },
  shopButton: {
    backgroundColor: '#6366f1',
    borderRadius: 10,
    paddingHorizontal: 30,
    paddingVertical: 15,
  },
  shopButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  footer: {
    backgroundColor: 'white',
    padding: 20,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: -2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  totalContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  totalLabel: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  totalAmount: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#6366f1',
  },
  checkoutButton: {
    backgroundColor: '#6366f1',
    borderRadius: 10,
    height: 50,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  buttonIcon: {
    marginRight: 10,
  },
  checkoutButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
});