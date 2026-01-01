import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  Dimensions,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../context/AuthContext';
import { API_CONFIG, apiRequest } from '../config/api';

const { width } = Dimensions.get('window');

export default function AdminAnalyticsScreen({ navigation }) {
  const [dashboardStats, setDashboardStats] = useState({});
  const [salesStats, setSalesStats] = useState({});
  const [productStats, setProductStats] = useState({});
  const [customerStats, setCustomerStats] = useState({});
  const [topProducts, setTopProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedPeriod, setSelectedPeriod] = useState('MONTH');

  const { user: currentUser, token } = useAuth();

  useEffect(() => {
    if (currentUser?.role !== 'ADMIN') {
      Alert.alert('Accès refusé', 'Vous devez être administrateur pour accéder à cette page');
      navigation.goBack();
      return;
    }
    loadAllStats();
  }, [selectedPeriod]);

  const loadAllStats = async () => {
    try {
      setLoading(true);
      await Promise.all([
        loadDashboardStats(),
        loadSalesStats(),
        loadProductStats(),
        loadCustomerStats(),
        loadTopProducts(),
      ]);
    } catch (error) {
      console.error('Error loading analytics:', error);
      Alert.alert('Erreur', 'Impossible de charger les statistiques');
    } finally {
      setLoading(false);
    }
  };

  const loadDashboardStats = async () => {
    try {
      const response = await apiRequest('/analytics/dashboard', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      setDashboardStats(response);
    } catch (error) {
      console.error('Error loading dashboard stats:', error);
    }
  };

  const loadSalesStats = async () => {
    try {
      const response = await apiRequest(`/analytics/sales?period=${selectedPeriod}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      setSalesStats(response);
    } catch (error) {
      console.error('Error loading sales stats:', error);
    }
  };

  const loadProductStats = async () => {
    try {
      const response = await apiRequest('/analytics/products', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      setProductStats(response);
    } catch (error) {
      console.error('Error loading product stats:', error);
    }
  };

  const loadCustomerStats = async () => {
    try {
      const response = await apiRequest('/analytics/customers', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      setCustomerStats(response);
    } catch (error) {
      console.error('Error loading customer stats:', error);
    }
  };

  const loadTopProducts = async () => {
    try {
      const response = await apiRequest('/analytics/top-products?limit=5', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      setTopProducts(response.products || []);
    } catch (error) {
      console.error('Error loading top products:', error);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadAllStats();
    setRefreshing(false);
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'EUR',
    }).format(amount || 0);
  };

  const StatCard = ({ title, value, icon, color, subtitle }) => (
    <View style={[styles.statCard, { borderLeftColor: color }]}>
      <View style={styles.statContent}>
        <View style={styles.statInfo}>
          <Text style={styles.statValue}>{value}</Text>
          <Text style={styles.statTitle}>{title}</Text>
          {subtitle && <Text style={styles.statSubtitle}>{subtitle}</Text>}
        </View>
        <View style={[styles.statIcon, { backgroundColor: color }]}>
          <Ionicons name={icon} size={24} color="white" />
        </View>
      </View>
    </View>
  );

  const SectionCard = ({ title, children, icon }) => (
    <View style={styles.sectionCard}>
      <View style={styles.sectionHeader}>
        <Ionicons name={icon} size={20} color="#007AFF" />
        <Text style={styles.sectionTitle}>{title}</Text>
      </View>
      {children}
    </View>
  );

  const PeriodSelector = () => (
    <View style={styles.periodSelector}>
      {['DAY', 'WEEK', 'MONTH'].map((period) => (
        <TouchableOpacity
          key={period}
          style={[
            styles.periodButton,
            selectedPeriod === period && styles.periodButtonActive,
          ]}
          onPress={() => setSelectedPeriod(period)}
        >
          <Text
            style={[
              styles.periodButtonText,
              selectedPeriod === period && styles.periodButtonTextActive,
            ]}
          >
            {period === 'DAY' ? 'Jour' : period === 'WEEK' ? 'Semaine' : 'Mois'}
          </Text>
        </TouchableOpacity>
      ))}
    </View>
  );

  return (
    <ScrollView
      style={styles.container}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      showsVerticalScrollIndicator={false}
    >
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>Rapports et Analyses</Text>
        <Text style={styles.subtitle}>Vue d'ensemble des performances</Text>
      </View>

      {/* Statistiques principales */}
      <View style={styles.section}>
        <Text style={styles.sectionLabel}>Vue d'ensemble</Text>
        <View style={styles.statsGrid}>
          <StatCard
            title="Revenus totaux"
            value={formatCurrency(dashboardStats.totalRevenue)}
            icon="cash-outline"
            color="#34C759"
          />
          <StatCard
            title="Commandes"
            value={dashboardStats.totalOrders || 0}
            icon="receipt-outline"
            color="#007AFF"
          />
          <StatCard
            title="Clients"
            value={dashboardStats.totalUsers || 0}
            icon="people-outline"
            color="#FF9500"
          />
          <StatCard
            title="Produits"
            value={dashboardStats.totalProducts || 0}
            icon="cube-outline"
            color="#AF52DE"
          />
        </View>
      </View>

      {/* Statistiques du mois */}
      <View style={styles.section}>
        <Text style={styles.sectionLabel}>Ce mois-ci</Text>
        <View style={styles.statsGrid}>
          <StatCard
            title="Revenus"
            value={formatCurrency(dashboardStats.revenueThisMonth)}
            icon="trending-up-outline"
            color="#34C759"
            subtitle="Ce mois"
          />
          <StatCard
            title="Commandes"
            value={dashboardStats.ordersThisMonth || 0}
            icon="bag-outline"
            color="#007AFF"
            subtitle="Ce mois"
          />
          <StatCard
            title="En attente"
            value={dashboardStats.pendingOrders || 0}
            icon="time-outline"
            color="#FF9500"
            subtitle="À traiter"
          />
          <StatCard
            title="Stock faible"
            value={dashboardStats.lowStockProducts || 0}
            icon="warning-outline"
            color="#FF3B30"
            subtitle="< 10 unités"
          />
        </View>
      </View>

      {/* Sélecteur de période */}
      <View style={styles.section}>
        <Text style={styles.sectionLabel}>Analyse des ventes</Text>
        <PeriodSelector />
      </View>

      {/* Statistiques de ventes */}
      <SectionCard title="Ventes détaillées" icon="analytics-outline">
        <View style={styles.salesStats}>
          <View style={styles.salesRow}>
            <Text style={styles.salesLabel}>Revenus totaux:</Text>
            <Text style={styles.salesValue}>{formatCurrency(salesStats.totalRevenue)}</Text>
          </View>
          <View style={styles.salesRow}>
            <Text style={styles.salesLabel}>Nombre de commandes:</Text>
            <Text style={styles.salesValue}>{salesStats.totalOrders || 0}</Text>
          </View>
          <View style={styles.salesRow}>
            <Text style={styles.salesLabel}>Panier moyen:</Text>
            <Text style={styles.salesValue}>{formatCurrency(salesStats.averageOrderValue)}</Text>
          </View>
        </View>
      </SectionCard>

      {/* Top produits */}
      <SectionCard title="Produits populaires" icon="star-outline">
        {topProducts.length > 0 ? (
          topProducts.map((product, index) => (
            <View key={product.id} style={styles.productRow}>
              <View style={styles.productRank}>
                <Text style={styles.rankText}>{index + 1}</Text>
              </View>
              <View style={styles.productInfo}>
                <Text style={styles.productName}>{product.nom}</Text>
                <Text style={styles.productDetails}>
                  Stock: {product.stock} • Prix: {formatCurrency(product.prix)}
                </Text>
              </View>
              <View style={styles.productStats}>
                <Text style={styles.productRevenue}>{formatCurrency(product.revenue)}</Text>
                <Text style={styles.productSold}>{product.totalSold} vendus</Text>
              </View>
            </View>
          ))
        ) : (
          <Text style={styles.noDataText}>Aucune donnée disponible</Text>
        )}
      </SectionCard>

      {/* Statistiques produits */}
      <SectionCard title="Gestion des stocks" icon="cube-outline">
        <View style={styles.stockStats}>
          <View style={styles.stockRow}>
            <Text style={styles.stockLabel}>Valeur totale du stock:</Text>
            <Text style={styles.stockValue}>{formatCurrency(productStats.totalStockValue)}</Text>
          </View>
          <View style={styles.stockRow}>
            <Text style={styles.stockLabel}>Produits en stock faible:</Text>
            <Text style={[styles.stockValue, { color: '#FF9500' }]}>
              {productStats.lowStockCount || 0}
            </Text>
          </View>
          <View style={styles.stockRow}>
            <Text style={styles.stockLabel}>Produits en rupture:</Text>
            <Text style={[styles.stockValue, { color: '#FF3B30' }]}>
              {productStats.outOfStockCount || 0}
            </Text>
          </View>
        </View>
      </SectionCard>

      {/* Statistiques clients */}
      <SectionCard title="Analyse des clients" icon="people-outline">
        <View style={styles.customerStats}>
          <View style={styles.customerRow}>
            <Text style={styles.customerLabel}>Total clients:</Text>
            <Text style={styles.customerValue}>{customerStats.totalCustomers || 0}</Text>
          </View>
          <View style={styles.customerRow}>
            <Text style={styles.customerLabel}>Clients actifs:</Text>
            <Text style={styles.customerValue}>{customerStats.activeCustomers || 0}</Text>
          </View>
          <View style={styles.customerRow}>
            <Text style={styles.customerLabel}>Taux d'activité:</Text>
            <Text style={styles.customerValue}>
              {customerStats.totalCustomers > 0
                ? Math.round((customerStats.activeCustomers / customerStats.totalCustomers) * 100)
                : 0}%
            </Text>
          </View>
        </View>
      </SectionCard>

      {/* Actions rapides */}
      <View style={styles.section}>
        <Text style={styles.sectionLabel}>Actions rapides</Text>
        <View style={styles.quickActions}>
          <TouchableOpacity
            style={[styles.quickActionButton, { backgroundColor: '#007AFF' }]}
            onPress={() => navigation.navigate('AdminProducts')}
          >
            <Ionicons name="cube" size={20} color="white" />
            <Text style={styles.quickActionText}>Gérer Produits</Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={[styles.quickActionButton, { backgroundColor: '#34C759' }]}
            onPress={() => navigation.navigate('AdminOrders')}
          >
            <Ionicons name="receipt" size={20} color="white" />
            <Text style={styles.quickActionText}>Voir Commandes</Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={[styles.quickActionButton, { backgroundColor: '#FF9500' }]}
            onPress={() => navigation.navigate('AdminUsers')}
          >
            <Ionicons name="people" size={20} color="white" />
            <Text style={styles.quickActionText}>Gérer Clients</Text>
          </TouchableOpacity>
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
  header: {
    backgroundColor: 'white',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 14,
    color: '#666',
  },
  section: {
    padding: 16,
  },
  sectionLabel: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 12,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: 12,
  },
  statCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    width: (width - 44) / 2,
    borderLeftWidth: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  statContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  statInfo: {
    flex: 1,
  },
  statValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  statTitle: {
    fontSize: 12,
    color: '#666',
  },
  statSubtitle: {
    fontSize: 10,
    color: '#999',
    marginTop: 2,
  },
  statIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  sectionCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    marginHorizontal: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginLeft: 8,
  },
  periodSelector: {
    flexDirection: 'row',
    backgroundColor: 'white',
    borderRadius: 8,
    padding: 4,
    marginBottom: 16,
  },
  periodButton: {
    flex: 1,
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 6,
    alignItems: 'center',
  },
  periodButtonActive: {
    backgroundColor: '#007AFF',
  },
  periodButtonText: {
    fontSize: 14,
    color: '#666',
    fontWeight: '500',
  },
  periodButtonTextActive: {
    color: 'white',
    fontWeight: 'bold',
  },
  salesStats: {
    gap: 12,
  },
  salesRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  salesLabel: {
    fontSize: 14,
    color: '#666',
  },
  salesValue: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#333',
  },
  productRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  productRank: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: '#007AFF',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  rankText: {
    color: 'white',
    fontSize: 12,
    fontWeight: 'bold',
  },
  productInfo: {
    flex: 1,
  },
  productName: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 2,
  },
  productDetails: {
    fontSize: 12,
    color: '#666',
  },
  productStats: {
    alignItems: 'flex-end',
  },
  productRevenue: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#34C759',
  },
  productSold: {
    fontSize: 12,
    color: '#666',
  },
  stockStats: {
    gap: 12,
  },
  stockRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
  },
  stockLabel: {
    fontSize: 14,
    color: '#666',
  },
  stockValue: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#333',
  },
  customerStats: {
    gap: 12,
  },
  customerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
  },
  customerLabel: {
    fontSize: 14,
    color: '#666',
  },
  customerValue: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#333',
  },
  quickActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
  },
  quickActionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    borderRadius: 12,
    gap: 8,
  },
  quickActionText: {
    color: 'white',
    fontSize: 12,
    fontWeight: 'bold',
  },
  noDataText: {
    textAlign: 'center',
    color: '#666',
    fontStyle: 'italic',
    paddingVertical: 20,
  },
});