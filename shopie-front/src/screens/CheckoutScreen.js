import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { API_CONFIG } from '../config/api';

export default function CheckoutScreen({ navigation }) {
  const [loading, setLoading] = useState(false);
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState('Stripe');
  const { cartItems, getCartTotal, clearCart } = useCart();
  const { authenticatedRequest } = useAuth();

  const paymentMethods = [
    { id: 'Stripe', name: 'Carte bancaire (Stripe)', icon: 'card-outline' },
    { id: 'PayPal', name: 'PayPal', icon: 'logo-paypal' },
    { id: 'Apple Pay', name: 'Apple Pay', icon: 'logo-apple' },
  ];

  const handleCreateOrder = async () => {
    try {
      setLoading(true);

      // Créer la commande (qui vide automatiquement le panier)
      const orderResponse = await authenticatedRequest(API_CONFIG.ENDPOINTS.ORDERS, {
        method: 'POST',
      });

      if (!orderResponse || !orderResponse.id) {
        throw new Error('Erreur lors de la création de la commande');
      }

      // Afficher le succès et naviguer
      Alert.alert(
        'Commande confirmée !',
        `Votre commande #${orderResponse.id} a été passée avec succès.\nMontant: ${orderResponse.total.toFixed(2)} €\nStatut: En attente`,
        [
          {
            text: 'Voir mes commandes',
            onPress: () => navigation.navigate('Main', { screen: 'Commandes' }),
          },
        ]
      );

    } catch (error) {
      console.error('Checkout error:', error);
      Alert.alert(
        'Erreur de commande',
        error.message || 'Une erreur est survenue lors du traitement de votre commande'
      );
    } finally {
      setLoading(false);
    }
  };

  const renderOrderSummary = () => (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>Résumé de la commande</Text>
      {cartItems.map((item) => (
        <View key={item.id} style={styles.orderItem}>
          <Text style={styles.itemName} numberOfLines={1}>
            {item.product?.nom}
          </Text>
          <Text style={styles.itemQuantity}>x{item.quantite}</Text>
          <Text style={styles.itemPrice}>
            {((item.product?.prix || 0) * item.quantite).toFixed(2)} €
          </Text>
        </View>
      ))}
      <View style={styles.totalRow}>
        <Text style={styles.totalLabel}>Total</Text>
        <Text style={styles.totalAmount}>{getCartTotal().toFixed(2)} €</Text>
      </View>
    </View>
  );

  const renderPaymentMethods = () => (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>Méthode de paiement</Text>
      {paymentMethods.map((method) => (
        <TouchableOpacity
          key={method.id}
          style={[
            styles.paymentMethod,
            selectedPaymentMethod === method.id && styles.paymentMethodSelected,
          ]}
          onPress={() => setSelectedPaymentMethod(method.id)}
        >
          <Ionicons
            name={method.icon}
            size={24}
            color={selectedPaymentMethod === method.id ? '#6366f1' : '#666'}
          />
          <Text
            style={[
              styles.paymentMethodText,
              selectedPaymentMethod === method.id && styles.paymentMethodTextSelected,
            ]}
          >
            {method.name}
          </Text>
          <Ionicons
            name={selectedPaymentMethod === method.id ? 'radio-button-on' : 'radio-button-off'}
            size={20}
            color={selectedPaymentMethod === method.id ? '#6366f1' : '#ccc'}
          />
        </TouchableOpacity>
      ))}
    </View>
  );

  if (cartItems.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <Ionicons name="cart-outline" size={64} color="#ccc" />
        <Text style={styles.emptyText}>Votre panier est vide</Text>
        <TouchableOpacity
          style={styles.shopButton}
          onPress={() => navigation.navigate('Main', { screen: 'Accueil' })}
        >
          <Text style={styles.shopButtonText}>Retour aux achats</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <ScrollView style={styles.content}>
        {renderOrderSummary()}
        {renderPaymentMethods()}
        
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Informations importantes</Text>
          <View style={styles.infoBox}>
            <Ionicons name="information-circle-outline" size={20} color="#6366f1" />
            <Text style={styles.infoText}>
              Ceci est une démonstration. Aucun paiement réel ne sera effectué.
            </Text>
          </View>
        </View>
      </ScrollView>

      <View style={styles.footer}>
        <TouchableOpacity
          style={[styles.confirmButton, loading && styles.confirmButtonDisabled]}
          onPress={handleCreateOrder}
          disabled={loading}
        >
          <Ionicons name="checkmark-circle" size={20} color="white" style={styles.buttonIcon} />
          <Text style={styles.confirmButtonText}>
            {loading ? 'Traitement...' : `Confirmer - ${getCartTotal().toFixed(2)} €`}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  content: {
    flex: 1,
  },
  section: {
    backgroundColor: 'white',
    margin: 10,
    borderRadius: 10,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 3,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 15,
  },
  orderItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  itemName: {
    flex: 1,
    fontSize: 14,
    marginRight: 10,
  },
  itemQuantity: {
    fontSize: 14,
    color: '#666',
    marginRight: 10,
  },
  itemPrice: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#6366f1',
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 15,
    marginTop: 10,
    borderTopWidth: 2,
    borderTopColor: '#6366f1',
  },
  totalLabel: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  totalAmount: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#6366f1',
  },
  paymentMethod: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 15,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 10,
    marginBottom: 10,
  },
  paymentMethodSelected: {
    borderColor: '#6366f1',
    backgroundColor: '#f8faff',
  },
  paymentMethodText: {
    flex: 1,
    fontSize: 16,
    marginLeft: 15,
    color: '#333',
  },
  paymentMethodTextSelected: {
    color: '#6366f1',
    fontWeight: '600',
  },
  infoBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f8faff',
    padding: 15,
    borderRadius: 10,
    borderLeftWidth: 4,
    borderLeftColor: '#6366f1',
  },
  infoText: {
    flex: 1,
    fontSize: 14,
    color: '#666',
    marginLeft: 10,
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
  confirmButton: {
    backgroundColor: '#6366f1',
    borderRadius: 10,
    height: 50,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  confirmButtonDisabled: {
    backgroundColor: '#ccc',
  },
  buttonIcon: {
    marginRight: 10,
  },
  confirmButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
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
});