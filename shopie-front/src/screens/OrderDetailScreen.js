import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../context/AuthContext';
import { API_CONFIG } from '../config/api';

export default function OrderDetailScreen({ route, navigation }) {
  const { orderId } = route.params;
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(false);
  const { authenticatedRequest } = useAuth();

  useEffect(() => {
    loadOrderDetails();
  }, []);

  const loadOrderDetails = async () => {
    try {
      setLoading(true);
      const response = await authenticatedRequest(`${API_CONFIG.ENDPOINTS.ORDERS}/${orderId}`);
      setOrder(response);
    } catch (error) {
      console.error('Error loading order details:', error);
      Alert.alert('Erreur', 'Impossible de charger les détails de la commande');
      navigation.goBack();
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'PENDING':
        return '#f59e0b';
      case 'PAID':
        return '#10b981';
      case 'SHIPPED':
        return '#3b82f6';
      case 'DELIVERED':
        return '#059669';
      default:
        return '#6b7280';
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'PENDING':
        return 'En attente';
      case 'PAID':
        return 'Payée';
      case 'SHIPPED':
        return 'Expédiée';
      case 'DELIVERED':
        return 'Livrée';
      default:
        return status;
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'PENDING':
        return 'time-outline';
      case 'PAID':
        return 'checkmark-circle-outline';
      case 'SHIPPED':
        return 'airplane-outline';
      case 'DELIVERED':
        return 'checkmark-done-outline';
      default:
        return 'help-circle-outline';
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <Text>Chargement...</Text>
      </View>
    );
  }

  if (!order) {
    return (
      <View style={styles.centerContainer}>
        <Text>Commande non trouvée</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Commande #{order.id}</Text>
        <View style={[styles.statusBadge, { backgroundColor: getStatusColor(order.statut) }]}>
          <Ionicons 
            name={getStatusIcon(order.statut)} 
            size={16} 
            color="white" 
            style={styles.statusIcon}
          />
          <Text style={styles.statusText}>
            {getStatusText(order.statut)}
          </Text>
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Informations de la commande</Text>
        
        <View style={styles.infoRow}>
          <Ionicons name="calendar-outline" size={20} color="#666" />
          <View style={styles.infoContent}>
            <Text style={styles.infoLabel}>Date de commande</Text>
            <Text style={styles.infoValue}>{formatDate(order.date)}</Text>
          </View>
        </View>

        <View style={styles.infoRow}>
          <Ionicons name="pricetag-outline" size={20} color="#666" />
          <View style={styles.infoContent}>
            <Text style={styles.infoLabel}>Total</Text>
            <Text style={styles.infoValue}>{order.total?.toFixed(2)} €</Text>
          </View>
        </View>

        <View style={styles.infoRow}>
          <Ionicons name="information-circle-outline" size={20} color="#666" />
          <View style={styles.infoContent}>
            <Text style={styles.infoLabel}>Statut</Text>
            <Text style={[styles.infoValue, { color: getStatusColor(order.statut) }]}>
              {getStatusText(order.statut)}
            </Text>
          </View>
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Suivi de commande</Text>
        
        <View style={styles.trackingContainer}>
          <View style={styles.trackingStep}>
            <View style={[styles.trackingDot, { backgroundColor: '#10b981' }]} />
            <View style={styles.trackingContent}>
              <Text style={styles.trackingTitle}>Commande passée</Text>
              <Text style={styles.trackingDate}>{formatDate(order.date)}</Text>
            </View>
          </View>

          <View style={styles.trackingLine} />

          <View style={styles.trackingStep}>
            <View style={[
              styles.trackingDot, 
              { backgroundColor: ['PAID', 'SHIPPED', 'DELIVERED'].includes(order.statut) ? '#10b981' : '#e5e7eb' }
            ]} />
            <View style={styles.trackingContent}>
              <Text style={[
                styles.trackingTitle,
                { color: ['PAID', 'SHIPPED', 'DELIVERED'].includes(order.statut) ? '#333' : '#999' }
              ]}>
                Paiement confirmé
              </Text>
              <Text style={styles.trackingDate}>
                {['PAID', 'SHIPPED', 'DELIVERED'].includes(order.statut) ? 'Confirmé' : 'En attente'}
              </Text>
            </View>
          </View>

          <View style={styles.trackingLine} />

          <View style={styles.trackingStep}>
            <View style={[
              styles.trackingDot, 
              { backgroundColor: ['SHIPPED', 'DELIVERED'].includes(order.statut) ? '#10b981' : '#e5e7eb' }
            ]} />
            <View style={styles.trackingContent}>
              <Text style={[
                styles.trackingTitle,
                { color: ['SHIPPED', 'DELIVERED'].includes(order.statut) ? '#333' : '#999' }
              ]}>
                Expédition
              </Text>
              <Text style={styles.trackingDate}>
                {['SHIPPED', 'DELIVERED'].includes(order.statut) ? 'Expédiée' : 'En attente'}
              </Text>
            </View>
          </View>

          <View style={styles.trackingLine} />

          <View style={styles.trackingStep}>
            <View style={[
              styles.trackingDot, 
              { backgroundColor: order.statut === 'DELIVERED' ? '#10b981' : '#e5e7eb' }
            ]} />
            <View style={styles.trackingContent}>
              <Text style={[
                styles.trackingTitle,
                { color: order.statut === 'DELIVERED' ? '#333' : '#999' }
              ]}>
                Livraison
              </Text>
              <Text style={styles.trackingDate}>
                {order.statut === 'DELIVERED' ? 'Livrée' : 'En attente'}
              </Text>
            </View>
          </View>
        </View>
      </View>
    </ScrollView>
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
    padding: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
  },
  statusIcon: {
    marginRight: 6,
  },
  statusText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
  },
  section: {
    backgroundColor: 'white',
    margin: 15,
    borderRadius: 12,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 3,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 15,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  infoContent: {
    flex: 1,
    marginLeft: 15,
  },
  infoLabel: {
    fontSize: 14,
    color: '#666',
    marginBottom: 2,
  },
  infoValue: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  trackingContainer: {
    paddingVertical: 10,
  },
  trackingStep: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
  },
  trackingDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 15,
  },
  trackingContent: {
    flex: 1,
  },
  trackingTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 2,
  },
  trackingDate: {
    fontSize: 14,
    color: '#666',
  },
  trackingLine: {
    width: 2,
    height: 20,
    backgroundColor: '#e5e7eb',
    marginLeft: 5,
    marginVertical: 2,
  },
});