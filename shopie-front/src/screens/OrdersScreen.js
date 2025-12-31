import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  TouchableOpacity,
  RefreshControl,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../context/AuthContext';
import { API_CONFIG } from '../config/api';

export default function OrdersScreen({ navigation }) {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const { authenticatedRequest, user } = useAuth();

  // Rediriger les admins vers leur interface de gestion
  useEffect(() => {
    if (user?.role === 'ADMIN') {
      navigation.navigate('AdminOrders');
      return;
    }
    loadOrders();
  }, []);

  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', () => {
      if (user?.role !== 'ADMIN') {
        loadOrders();
      }
    });
    return unsubscribe;
  }, [navigation, user]);

  const loadOrders = async () => {
    try {
      setLoading(true);
      const response = await authenticatedRequest(API_CONFIG.ENDPOINTS.ORDERS);
      setOrders(response || []);
    } catch (error) {
      console.error('Error loading orders:', error);
      Alert.alert('Erreur', 'Impossible de charger les commandes');
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadOrders();
    setRefreshing(false);
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

  const renderOrder = ({ item }) => (
    <TouchableOpacity
      style={styles.orderCard}
      onPress={() => navigation.navigate('OrderDetail', { orderId: item.id })}
    >
      <View style={styles.orderHeader}>
        <Text style={styles.orderId}>Commande #{item.id}</Text>
        <View style={[styles.statusBadge, { backgroundColor: getStatusColor(item.statut) }]}>
          <Ionicons 
            name={getStatusIcon(item.statut)} 
            size={14} 
            color="white" 
            style={styles.statusIcon}
          />
          <Text style={styles.statusText}>
            {getStatusText(item.statut)}
          </Text>
        </View>
      </View>

      <View style={styles.orderInfo}>
        <View style={styles.orderRow}>
          <Ionicons name="calendar-outline" size={16} color="#666" />
          <Text style={styles.orderDate}>
            {formatDate(item.date)}
          </Text>
        </View>

        <View style={styles.orderRow}>
          <Ionicons name="pricetag-outline" size={16} color="#666" />
          <Text style={styles.orderTotal}>
            {item.total?.toFixed(2)} €
          </Text>
        </View>

        {item.orderItems && item.orderItems.length > 0 && (
          <View style={styles.orderRow}>
            <Ionicons name="cube-outline" size={16} color="#666" />
            <Text style={styles.orderItems}>
              {item.orderItems.length} article{item.orderItems.length > 1 ? 's' : ''}
            </Text>
          </View>
        )}
      </View>

      <View style={styles.orderFooter}>
        <Text style={styles.viewDetails}>Voir les détails</Text>
        <Ionicons name="chevron-forward" size={16} color="#6366f1" />
      </View>
    </TouchableOpacity>
  );

  if (loading && orders.length === 0) {
    return (
      <View style={styles.centerContainer}>
        <Text>Chargement des commandes...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Mes Commandes</Text>
      </View>

      {orders.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Ionicons name="receipt-outline" size={64} color="#ccc" />
          <Text style={styles.emptyText}>Aucune commande</Text>
          <Text style={styles.emptySubtext}>
            Vos commandes apparaîtront ici une fois que vous aurez effectué un achat
          </Text>
          <TouchableOpacity
            style={styles.shopButton}
            onPress={() => navigation.navigate('Accueil')}
          >
            <Text style={styles.shopButtonText}>Commencer mes achats</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList
          data={orders}
          renderItem={renderOrder}
          keyExtractor={(item) => item.id.toString()}
          contentContainerStyle={styles.ordersList}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
        />
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
  ordersList: {
    padding: 10,
  },
  orderCard: {
    backgroundColor: 'white',
    borderRadius: 10,
    padding: 15,
    marginBottom: 10,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 3,
  },
  orderHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  orderId: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusIcon: {
    marginRight: 4,
  },
  statusText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '600',
  },
  orderInfo: {
    marginBottom: 10,
  },
  orderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 5,
  },
  orderDate: {
    fontSize: 14,
    color: '#666',
    marginLeft: 8,
  },
  orderTotal: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#6366f1',
    marginLeft: 8,
  },
  orderItems: {
    fontSize: 14,
    color: '#666',
    marginLeft: 8,
  },
  orderFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
  },
  viewDetails: {
    fontSize: 14,
    color: '#6366f1',
    fontWeight: '600',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  emptyText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#666',
    marginTop: 20,
    marginBottom: 10,
  },
  emptySubtext: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginBottom: 30,
    lineHeight: 22,
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