import React, { useState } from 'react';
import {
  View,
  Text,
  Image,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useCart } from '../context/CartContext';
import { API_CONFIG } from '../config/api';

export default function ProductDetailScreen({ route, navigation }) {
  const { product } = route.params;
  const [quantity, setQuantity] = useState(1);
  const { addToCart } = useCart();

  const handleAddToCart = async () => {
    const result = await addToCart(product.id, quantity);
    if (result.success) {
      Alert.alert(
        'Succès', 
        `${quantity} ${product.nom} ajouté(s) au panier`,
        [
          { text: 'Continuer', style: 'default' },
          { 
            text: 'Voir le panier', 
            onPress: () => navigation.navigate('Main', { screen: 'Panier' })
          }
        ]
      );
    } else {
      Alert.alert('Erreur', result.error || 'Impossible d\'ajouter au panier');
    }
  };

  const increaseQuantity = () => {
    if (quantity < product.stock) {
      setQuantity(quantity + 1);
    }
  };

  const decreaseQuantity = () => {
    if (quantity > 1) {
      setQuantity(quantity - 1);
    }
  };

  return (
    <ScrollView style={styles.container}>
      <Image
        source={{ 
          uri: product.imageUrl && product.imageUrl.startsWith('http') 
            ? product.imageUrl 
            : product.imageUrl 
              ? `${API_CONFIG.BASE_URL}${product.imageUrl}`
              : 'https://via.placeholder.com/400x300?text=No+Image'
        }}
        style={styles.productImage}
        defaultSource={{ uri: 'https://via.placeholder.com/400x300?text=No+Image' }}
      />
      
      <View style={styles.content}>
        <Text style={styles.productName}>{product.nom}</Text>
        
        <View style={styles.priceContainer}>
          <Text style={styles.price}>{product.prix?.toFixed(2)} €</Text>
          <View style={styles.stockContainer}>
            <Ionicons 
              name={product.stock > 0 ? "checkmark-circle" : "close-circle"} 
              size={20} 
              color={product.stock > 0 ? "#10b981" : "#ef4444"} 
            />
            <Text style={[
              styles.stockText,
              { color: product.stock > 0 ? "#10b981" : "#ef4444" }
            ]}>
              {product.stock > 0 ? `${product.stock} en stock` : 'Rupture de stock'}
            </Text>
          </View>
        </View>

        <Text style={styles.sectionTitle}>Description</Text>
        <Text style={styles.description}>
          {product.description || 'Aucune description disponible.'}
        </Text>

        {product.stock > 0 && (
          <>
            <Text style={styles.sectionTitle}>Quantité</Text>
            <View style={styles.quantityContainer}>
              <TouchableOpacity
                style={[styles.quantityButton, quantity <= 1 && styles.quantityButtonDisabled]}
                onPress={decreaseQuantity}
                disabled={quantity <= 1}
              >
                <Ionicons name="remove" size={20} color={quantity <= 1 ? "#ccc" : "#6366f1"} />
              </TouchableOpacity>
              
              <Text style={styles.quantityText}>{quantity}</Text>
              
              <TouchableOpacity
                style={[styles.quantityButton, quantity >= product.stock && styles.quantityButtonDisabled]}
                onPress={increaseQuantity}
                disabled={quantity >= product.stock}
              >
                <Ionicons name="add" size={20} color={quantity >= product.stock ? "#ccc" : "#6366f1"} />
              </TouchableOpacity>
            </View>

            <TouchableOpacity
              style={styles.addToCartButton}
              onPress={handleAddToCart}
            >
              <Ionicons name="cart" size={20} color="white" style={styles.buttonIcon} />
              <Text style={styles.addToCartText}>
                Ajouter au panier - {(product.prix * quantity).toFixed(2)} €
              </Text>
            </TouchableOpacity>
          </>
        )}

        {product.stock === 0 && (
          <View style={styles.outOfStockContainer}>
            <Ionicons name="alert-circle-outline" size={24} color="#ef4444" />
            <Text style={styles.outOfStockText}>
              Ce produit n'est actuellement pas disponible
            </Text>
          </View>
        )}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'white',
  },
  productImage: {
    width: '100%',
    height: 300,
    resizeMode: 'cover',
  },
  content: {
    padding: 20,
  },
  productName: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  priceContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  price: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#6366f1',
  },
  stockContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  stockText: {
    marginLeft: 5,
    fontSize: 14,
    fontWeight: '600',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
    marginTop: 10,
  },
  description: {
    fontSize: 16,
    lineHeight: 24,
    color: '#666',
    marginBottom: 20,
  },
  quantityContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 30,
  },
  quantityButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    borderWidth: 2,
    borderColor: '#6366f1',
    justifyContent: 'center',
    alignItems: 'center',
  },
  quantityButtonDisabled: {
    borderColor: '#ccc',
  },
  quantityText: {
    fontSize: 18,
    fontWeight: 'bold',
    marginHorizontal: 20,
    minWidth: 30,
    textAlign: 'center',
  },
  addToCartButton: {
    backgroundColor: '#6366f1',
    borderRadius: 10,
    height: 50,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 10,
  },
  buttonIcon: {
    marginRight: 10,
  },
  addToCartText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  outOfStockContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#fef2f2',
    padding: 15,
    borderRadius: 10,
    marginTop: 20,
  },
  outOfStockText: {
    color: '#ef4444',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 10,
  },
});