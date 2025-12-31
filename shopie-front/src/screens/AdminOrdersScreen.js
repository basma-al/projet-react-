import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  TouchableOpacity,
  RefreshControl,
  Alert,
  Modal,
  ScrollView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { API_CONFIG } from '../config/api';

export default function AdminOrdersScreen({ navigation }) {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [filterStatus, setFilterStatus] = useState('ALL');

  const { authenticatedRequest, user } = useAuth();
  const { getCartItemsCount } = useCart();

  const statusOptions = [
    { key: 'ALL', label: 'Toutes', color: '#6b7280' },
    { key: 'PENDING', label: 'En attente', color: '#f59e0b' },
    { key: 'PAID', label: 'Payées', color: '#10b981' },
    { key: 'SHIPPED', label: 'Expédiées', color: '#3b82f6' },
    { key: 'DELIVERED', label: 'Livrées', color: '#059669' },
  ];

  useEffect(() => {
    if (user?.role !== 'ADMIN') {
      Alert.alert('Accès refusé', 'Vous devez être administrateur pour accéder à cette page');
      navigation.goBack();
      return;
    }
    loadOrders();
  }, []);

  const loadOrders = async () => {
    try {
      setLoading(true);
      const endpoint = filterStatus === 'ALL' 
        ? '/orders/admin/all' 
        : `/orders/admin/status/${filterStatus}`;
      
      const response = await authenticatedRequest(endpoint);
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

  const updateOrderStatus = async (orderId, newStatus) => {
    try {
      await authenticatedRequest(`/orders/admin/${orderId}/status?statut=${newStatus}`, {
        method: 'PUT',
      });
      
      Alert.alert('Succès', 'Statut de la commande mis à jour');
      setModalVisible(false);
      loadOrders();
    } catch (error) {
      console.error('Error updating order status:', error);
      Alert.alert('Erreur', 'Impossible de mettre à jour le statut');
    }
  };

  const getStatusColor = (status) => {
    const statusOption = statusOptions.find(s => s.key === status);
    return statusOption ? statusOption.color : '#6b7280';
  };

  const getStatusText = (status) => {
    const statusOption = statusOptions.find(s => s.key === status);
    return statusOption ? statusOption.label : status;
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

  const openOrderDetails = (order) => {
    setSelectedOrder(order);
    setModalVisible(true);
  };

  const renderStatusFilter = () => (
    <ScrollView 
      horizontal 
      showsHorizontalScrollIndicator={false}
      style={styles.filterContainer}
      contentContainerStyle={styles.filterContent}
    >
      {statusOptions.map((status) => (
        <TouchableOpacity
          key={status.key}
          style={[
            styles.filterButton,
            filterStatus === status.key && styles.filterButtonActive,
            { borderColor: status.color }
          ]}
          onPress={() => {
            setFilterStatus(status.key);
            setTimeout(loadOrders, 100);
          }}
        >
          <Text style={[
            styles.filterButtonText,
            filterStatus === status.key && { color: status.color }
          ]}>
            {status.label}
          </Text>
        </TouchableOpacity>
      ))}
    </ScrollView>
  );

  const renderOrder = ({ item }) => (
    <TouchableOpacity
      style={styles.orderCard}
      onPress={() => openOrderDetails(item)}
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
      </View>

      <View style={styles.orderFooter}>
        <Text style={styles.viewDetails}>Gérer la commande</Text>
        <Ionicons name="chevron-forward" size={16} color="#6366f1" />
      </View>
    </TouchableOpacity>
  );

  const renderOrderDetailsModal = () => (
    <Modal
      animationType="slide"
      transparent={true}
      visible={modalVisible}
      onRequestClose={() => setModalVisible(false)}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <ScrollView showsVerticalScrollIndicator={false}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>
                Commande #{selectedOrder?.id}
              </Text>
              <TouchableOpacity onPress={() => setModalVisible(false)}>
                <Ionicons name="close" size={24} color="#666" />
              </TouchableOpacity>
            </View>

            {selectedOrder && (
              <>
                <View style={styles.orderDetailsSection}>
                  <Text style={styles.sectionTitle}>Informations</Text>
                  <View style={styles.detailRow}>
                    <Text style={styles.detailLabel}>Date :</Text>
                    <Text style={styles.detailValue}>
                      {formatDate(selectedOrder.date)}
                    </Text>
                  </View>
                  <View style={styles.detailRow}>
                    <Text style={styles.detailLabel}>Total :</Text>
                    <Text style={styles.detailValue}>
                      {selectedOrder.total?.toFixed(2)} €
                    </Text>
                  </View>
                  <View style={styles.detailRow}>
                    <Text style={styles.detailLabel}>Statut actuel :</Text>
                    <View style={[styles.statusBadge, { backgroundColor: getStatusColor(selectedOrder.statut) }]}>
                      <Text style={styles.statusText}>
                        {getStatusText(selectedOrder.statut)}
                      </Text>
                    </View>
                  </View>
                </View>

                <View style={styles.orderDetailsSection}>
                  <Text style={styles.sectionTitle}>Actions</Text>
                  <Text style={styles.sectionSubtitle}>
                    Changer le statut de la commande :
                  </Text>
                  
                  {statusOptions.slice(1).map((status) => (
                    <TouchableOpacity
                      key={status.key}
                      style={[
                        styles.statusActionButton,
                        selectedOrder.statut === status.key && styles.statusActionButtonDisabled
                      ]}
                      onPress={() => updateOrderStatus(selectedOrder.id, status.key)}
                      disabled={selectedOrder.statut === status.key}
                    >
                      <Ionicons 
                        name={getStatusIcon(status.key)} 
                        size={20} 
                        color={selectedOrder.statut === status.key ? '#ccc' : status.color}
                      />
                      <Text style={[
                        styles.statusActionText,
                        { color: selectedOrder.statut === status.key ? '#ccc' : status.color }
                      ]}>
                        Marquer comme {status.label.toLowerCase()}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </>
            )}
          </ScrollView>
        </View>
      </View>
    </Modal>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.headerContent}>
          <View>
            <Text style={styles.title}>Gestion des Commandes</Text>
            <Text style={styles.subtitle}>
              {orders.length} commande{orders.length > 1 ? 's' : ''}
            </Text>
          </View>
          <TouchableOpacity 
            style={styles.cartButton}
            onPress={() => navigation.navigate('Panier')}
          >
            <Ionicons name="cart-outline" size={24} color="#6366f1" />
            {getCartItemsCount() > 0 && (
              <View style={styles.cartBadge}>
                <Text style={styles.cartBadgeText}>
                  {getCartItemsCount()}
                </Text>
              </View>
            )}
          </TouchableOpacity>
        </View>
      </View>

      {renderStatusFilter()}

      {orders.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Ionicons name="receipt-outline" size={64} color="#ccc" />
          <Text style={styles.emptyText}>
            {filterStatus === 'ALL' ? 'Aucune commande' : `Aucune commande ${getStatusText(filterStatus).toLowerCase()}`}
          </Text>
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

      {renderOrderDetailsModal()}
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
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
  },
  cartButton: {
    position: 'relative',
    padding: 8,
  },
  cartBadge: {
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
  cartBadgeText: {
    color: 'white',
    fontSize: 12,
    fontWeight: 'bold',
  },
  filterContainer: {
    backgroundColor: 'white',
    paddingVertical: 15,
  },
  filterContent: {
    paddingHorizontal: 20,
  },
  filterButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#ddd',
    marginRight: 10,
    backgroundColor: 'white',
  },
  filterButtonActive: {
    backgroundColor: '#f8faff',
  },
  filterButtonText: {
    fontSize: 14,
    color: '#666',
    fontWeight: '600',
  },
  ordersList: {
    padding: 10,
  },
  orderCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  orderHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  orderId: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 15,
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
    marginBottom: 12,
  },
  orderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
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
  orderFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 12,
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
    fontSize: 18,
    color: '#666',
    marginTop: 20,
    textAlign: 'center',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 20,
    width: '90%',
    maxHeight: '80%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
  },
  orderDetailsSection: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 12,
  },
  sectionSubtitle: {
    fontSize: 14,
    color: '#666',
    marginBottom: 12,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  detailLabel: {
    fontSize: 16,
    color: '#666',
  },
  detailValue: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  statusActionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 8,
    backgroundColor: '#f9f9f9',
    marginBottom: 8,
  },
  statusActionButtonDisabled: {
    backgroundColor: '#f0f0f0',
  },
  statusActionText: {
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 12,
  },
});