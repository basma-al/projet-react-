import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../context/AuthContext';
import { API_CONFIG } from '../config/api';

export default function AdminDashboardScreen({ navigation }) {
  const [stats, setStats] = useState({
    totalProducts: 0,
    totalOrders: 0,
    totalUsers: 0,
    lowStockProducts: 0,
  });
  const [loading, setLoading] = useState(false);

  const { authenticatedRequest, user } = useAuth();

  useEffect(() => {
    if (user?.role !== 'ADMIN') {
      Alert.alert('Accès refusé', 'Vous devez être administrateur pour accéder à cette page');
      navigation.goBack();
      return;
    }
    loadDashboardStats();
  }, []);

  const loadDashboardStats = async () => {
    try {
      setLoading(true);
      // Charger les statistiques de base
      const products = await authenticatedRequest(API_CONFIG.ENDPOINTS.PRODUCTS);
      
      // Charger les statistiques des utilisateurs
      let userStats = { totalUsers: 0 };
      try {
        userStats = await authenticatedRequest(API_CONFIG.ENDPOINTS.ADMIN_USERS_STATS);
      } catch (error) {
        console.log('Could not load user stats:', error);
      }
      
      setStats({
        totalProducts: products?.length || 0,
        totalOrders: 0, // À implémenter si nécessaire
        totalUsers: userStats.totalUsers || 0,
        lowStockProducts: products?.filter(p => p.stock < 10).length || 0,
      });
    } catch (error) {
      console.error('Error loading dashboard stats:', error);
    } finally {
      setLoading(false);
    }
  };

  const adminMenuItems = [
    {
      title: 'Gestion des Produits',
      subtitle: 'Ajouter, modifier, supprimer des produits',
      icon: 'cube-outline',
      color: '#007AFF',
      onPress: () => navigation.navigate('AdminProducts'),
    },
    {
      title: 'Commandes',
      subtitle: 'Voir et gérer les commandes',
      icon: 'receipt-outline',
      color: '#34C759',
      onPress: () => navigation.navigate('AdminOrders'),
    },
    {
      title: 'Utilisateurs',
      subtitle: 'Gérer les comptes utilisateurs',
      icon: 'people-outline',
      color: '#FF9500',
      onPress: () => navigation.navigate('AdminUsers'),
    },
    {
      title: 'Statistiques',
      subtitle: 'Voir les rapports et analyses',
      icon: 'analytics-outline',
      color: '#AF52DE',
      onPress: () => Alert.alert('Info', 'Fonctionnalité à venir'),
    },
  ];

  const StatCard = ({ title, value, icon, color }) => (
    <View style={[styles.statCard, { borderLeftColor: color }]}>
      <View style={styles.statContent}>
        <View>
          <Text style={styles.statValue}>{value}</Text>
          <Text style={styles.statTitle}>{title}</Text>
        </View>
        <Ionicons name={icon} size={32} color={color} />
      </View>
    </View>
  );

  const MenuCard = ({ title, subtitle, icon, color, onPress }) => (
    <TouchableOpacity style={styles.menuCard} onPress={onPress}>
      <View style={[styles.menuIcon, { backgroundColor: color }]}>
        <Ionicons name={icon} size={24} color="white" />
      </View>
      <View style={styles.menuContent}>
        <Text style={styles.menuTitle}>{title}</Text>
        <Text style={styles.menuSubtitle}>{subtitle}</Text>
      </View>
      <Ionicons name="chevron-forward" size={20} color="#ccc" />
    </TouchableOpacity>
  );

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <View style={styles.header}>
        <Text style={styles.welcomeText}>Bienvenue, Admin</Text>
        <Text style={styles.subtitle}>Tableau de bord administrateur</Text>
      </View>

      {/* Statistiques */}
      <View style={styles.statsSection}>
        <Text style={styles.sectionTitle}>Statistiques</Text>
        <View style={styles.statsGrid}>
          <StatCard
            title="Produits"
            value={stats.totalProducts}
            icon="cube-outline"
            color="#007AFF"
          />
          <StatCard
            title="Utilisateurs"
            value={stats.totalUsers}
            icon="people-outline"
            color="#FF9500"
          />
          <StatCard
            title="Stock faible"
            value={stats.lowStockProducts}
            icon="warning-outline"
            color="#FF3B30"
          />
        </View>
      </View>

      {/* Menu d'administration */}
      <View style={styles.menuSection}>
        <Text style={styles.sectionTitle}>Administration</Text>
        {adminMenuItems.map((item, index) => (
          <MenuCard
            key={index}
            title={item.title}
            subtitle={item.subtitle}
            icon={item.icon}
            color={item.color}
            onPress={item.onPress}
          />
        ))}
      </View>

      {/* Actions rapides */}
      <View style={styles.quickActionsSection}>
        <Text style={styles.sectionTitle}>Actions rapides</Text>
        <View style={styles.quickActionsGrid}>
          <TouchableOpacity
            style={[styles.quickActionButton, { backgroundColor: '#007AFF' }]}
            onPress={() => navigation.navigate('AdminProducts')}
          >
            <Ionicons name="add" size={24} color="white" />
            <Text style={styles.quickActionText}>Nouveau Produit</Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={[styles.quickActionButton, { backgroundColor: '#34C759' }]}
            onPress={() => loadDashboardStats()}
          >
            <Ionicons name="refresh" size={24} color="white" />
            <Text style={styles.quickActionText}>Actualiser</Text>
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
  welcomeText: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
  },
  statsSection: {
    padding: 20,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 16,
  },
  statsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 8,
  },
  statCard: {
    flex: 1,
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
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
  statValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
  },
  statTitle: {
    fontSize: 14,
    color: '#666',
    marginTop: 4,
  },
  menuSection: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  menuCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  menuIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  menuContent: {
    flex: 1,
  },
  menuTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  menuSubtitle: {
    fontSize: 14,
    color: '#666',
  },
  quickActionsSection: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  quickActionsGrid: {
    flexDirection: 'row',
    gap: 12,
  },
  quickActionButton: {
    flex: 1,
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 80,
  },
  quickActionText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
    marginTop: 8,
    textAlign: 'center',
  },
});