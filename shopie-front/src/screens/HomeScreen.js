import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  TouchableOpacity,
  Image,
  TextInput,
  RefreshControl,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { API_CONFIG } from '../config/api';

export default function HomeScreen({ navigation }) {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const { authenticatedRequest, user } = useAuth();
  const { 
    addToCart, 
    isProductInCart, 
    getProductQuantityInCart, 
    removeProductFromCart,
    updateCartItem,
    cartItems,
    getCartItemsCount 
  } = useCart();

  useEffect(() => {
    loadProducts();
  }, []);

  const loadProducts = async () => {
    try {
      setLoading(true);
      const response = await authenticatedRequest(API_CONFIG.ENDPOINTS.PRODUCTS);
      setProducts(response || []);
    } catch (error) {
      console.error('Error loading products:', error);
      Alert.alert('Erreur', 'Impossible de charger les produits');
    } finally {
      setLoading(false);
    }
  };

  const searchProducts = async (query) => {
    if (!query.trim()) {
      loadProducts();
      return;
    }

    try {
      setLoading(true);
      const response = await authenticatedRequest(
        `${API_CONFIG.ENDPOINTS.PRODUCT_SEARCH}?nom=${encodeURIComponent(query)}`
      );
      setProducts(response || []);
    } catch (error) {
      console.error('Error searching products:', error);
      Alert.alert('Erreur', 'Erreur lors de la recherche');
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (text) => {
    setSearchQuery(text);
    if (text.length > 2) {
      searchProducts(text);
    } else if (text.length === 0) {
      loadProducts();
    }
  };

  const handleAddToCart = async (productId) => {
    const result = await addToCart(productId, 1);
    if (result.success) {
      Alert.alert('Succès', 'Produit ajouté au panier');
    } else {
      Alert.alert('Erreur', result.error || 'Impossible d\'ajouter au panier');
    }
  };

  const handleRemoveFromCart = async (productId) => {
    const result = await removeProductFromCart(productId);
    if (result.success) {
      Alert.alert('Succès', 'Produit retiré du panier');
    } else {
      Alert.alert('Erreur', result.error || 'Impossible de retirer du panier');
    }
  };

  const handleUpdateQuantity = async (productId, newQuantity) => {
    if (newQuantity <= 0) {
      handleRemoveFromCart(productId);
      return;
    }

    const cartItem = isProductInCart(productId);
    if (cartItem) {
      const result = await updateCartItem(cartItem.id, newQuantity);
      if (!result.success) {
        Alert.alert('Erreur', result.error || 'Impossible de modifier la quantité');
      }
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadProducts();
    setRefreshing(false);
  };

  const renderProduct = ({ item }) => {
    const isInCart = isProductInCart(item.id);
    const quantityInCart = getProductQuantityInCart(item.id);
    const isAdmin = user?.role === 'ADMIN';

    return (
      <TouchableOpacity
        style={styles.productCard}
        onPress={() => navigation.navigate('ProductDetail', { product: item })}
      >
        <Image
          source={{ 
            uri: item.imageUrl || 'https://via.placeholder.com/150x150?text=No+Image' 
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
            {item.nom}
          </Text>
          <Text style={styles.productDescription} numberOfLines={2}>
            {item.description}
          </Text>
          <View style={styles.productFooter}>
            <Text style={styles.productPrice}>
              {item.prix?.toFixed(2)} €
            </Text>
            
            {/* Boutons d'action selon le rôle et l'état du panier */}
            {!isAdmin && (
              <View style={styles.cartActions}>
                {isInCart ? (
                  <View style={styles.quantityControls}>
                    <TouchableOpacity
                      style={styles.quantityButton}
                      onPress={() => handleUpdateQuantity(item.id, quantityInCart - 1)}
                    >
                      <Ionicons name="remove" size={16} color="white" />
                    </TouchableOpacity>
                    <Text style={styles.quantityText}>{quantityInCart}</Text>
                    <TouchableOpacity
                      style={styles.quantityButton}
                      onPress={() => handleUpdateQuantity(item.id, quantityInCart + 1)}
                    >
                      <Ionicons name="add" size={16} color="white" />
                    </TouchableOpacity>
                  </View>
                ) : (
                  <TouchableOpacity
                    style={styles.addButton}
                    onPress={() => handleAddToCart(item.id)}
                    disabled={item.stock === 0}
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
              item.stock === 0 && styles.outOfStock,
              item.stock < 10 && item.stock > 0 && styles.lowStock
            ]}>
              {item.stock === 0 ? 'Rupture de stock' : `Stock: ${item.stock}`}
            </Text>
            {isInCart && !isAdmin && (
              <TouchableOpacity
                style={styles.removeButton}
                onPress={() => handleRemoveFromCart(item.id)}
              >
                <Ionicons name="trash-outline" size={14} color="#ef4444" />
                <Text style={styles.removeButtonText}>Retirer</Text>
              </TouchableOpacity>
            )}
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.headerTop}>
          <Text style={styles.title}>Shopie</Text>
          <TouchableOpacity 
            style={styles.cartButton}
            onPress={() => navigation.navigate('Panier')}
          >
            <Ionicons name="cart-outline" size={24} color="#6366f1" />
            {getCartItemsCount() > 0 && (
              <View style={styles.cartBadgeHeader}>
                <Text style={styles.cartBadgeHeaderText}>
                  {getCartItemsCount()}
                </Text>
              </View>
            )}
          </TouchableOpacity>
        </View>
        <View style={styles.searchContainer}>
          <Ionicons name="search" size={20} color="#666" style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            placeholder="Rechercher des produits..."
            value={searchQuery}
            onChangeText={handleSearch}
            placeholderTextColor="#666"
          />
        </View>
      </View>

      <FlatList
        data={products}
        renderItem={renderProduct}
        keyExtractor={(item) => item.id.toString()}
        numColumns={2}
        contentContainerStyle={styles.productList}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Ionicons name="storefront-outline" size={64} color="#ccc" />
            <Text style={styles.emptyText}>
              {loading ? 'Chargement...' : 'Aucun produit trouvé'}
            </Text>
          </View>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    backgroundColor: 'white',
    paddingTop: 50,
    paddingHorizontal: 20,
    paddingBottom: 20,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#6366f1',
  },
  cartButton: {
    position: 'relative',
    padding: 8,
  },
  cartBadgeHeader: {
    position: 'absolute',
    top: 0,
    right: 0,
    backgroundColor: '#ef4444',
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  cartBadgeHeaderText: {
    color: 'white',
    fontSize: 12,
    fontWeight: 'bold',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f9f9f9',
    borderRadius: 10,
    paddingHorizontal: 15,
    height: 45,
  },
  searchIcon: {
    marginRight: 10,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
  },
  productList: {
    padding: 10,
  },
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
  addButton: {
    backgroundColor: '#6366f1',
    borderRadius: 15,
    width: 30,
    height: 30,
    justifyContent: 'center',
    alignItems: 'center',
  },
  cartActions: {
    flexDirection: 'row',
    alignItems: 'center',
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
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 100,
  },
  emptyText: {
    fontSize: 16,
    color: '#666',
    marginTop: 10,
  },
});