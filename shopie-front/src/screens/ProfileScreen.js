import React from 'react';
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

export default function ProfileScreen({ navigation }) {
  const { user, logout } = useAuth();

  const handleLogout = () => {
    Alert.alert(
      'Déconnexion',
      'Êtes-vous sûr de vouloir vous déconnecter ?',
      [
        { text: 'Annuler', style: 'cancel' },
        {
          text: 'Déconnexion',
          style: 'destructive',
          onPress: logout,
        },
      ]
    );
  };

  const menuItems = [
    {
      id: 'orders',
      title: 'Mes commandes',
      icon: 'receipt-outline',
      onPress: () => navigation.navigate('Commandes'),
    },
    {
      id: 'cart',
      title: 'Mon panier',
      icon: 'cart-outline',
      onPress: () => navigation.navigate('Panier'),
    },
    ...(user?.role === 'ADMIN' ? [{
      id: 'admin',
      title: 'Administration',
      icon: 'settings-outline',
      onPress: () => navigation.navigate('Admin'),
    }] : []),
    {
      id: 'help',
      title: 'Aide et support',
      icon: 'help-circle-outline',
      onPress: () => Alert.alert('Aide', 'Contactez-nous à support@shopie.com'),
    },
    {
      id: 'about',
      title: 'À propos',
      icon: 'information-circle-outline',
      onPress: () => Alert.alert('À propos', 'Shopie v1.0.0\nApplication de démonstration e-commerce'),
    },
  ];

  const renderMenuItem = (item) => (
    <TouchableOpacity
      key={item.id}
      style={styles.menuItem}
      onPress={item.onPress}
    >
      <View style={styles.menuItemLeft}>
        <Ionicons name={item.icon} size={24} color="#6366f1" />
        <Text style={styles.menuItemText}>{item.title}</Text>
      </View>
      <Ionicons name="chevron-forward" size={20} color="#ccc" />
    </TouchableOpacity>
  );

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Profil</Text>
      </View>

      <View style={styles.profileCard}>
        <View style={styles.avatarContainer}>
          <View style={styles.avatar}>
            <Ionicons name="person" size={40} color="white" />
          </View>
        </View>
        
        <View style={styles.userInfo}>
          <Text style={styles.userName}>{user?.nom || 'Utilisateur'}</Text>
          <Text style={styles.userEmail}>{user?.email || 'email@example.com'}</Text>
          <View style={[
            styles.roleBadge, 
            user?.role === 'ADMIN' && styles.adminBadge
          ]}>
            <Text style={[
              styles.roleText,
              user?.role === 'ADMIN' && styles.adminText
            ]}>
              {user?.role === 'ADMIN' ? 'Administrateur' : 'Utilisateur'}
            </Text>
          </View>
        </View>
      </View>

      <View style={styles.menuSection}>
        <Text style={styles.sectionTitle}>Menu</Text>
        {menuItems.map(renderMenuItem)}
      </View>

      <View style={styles.menuSection}>
        <Text style={styles.sectionTitle}>Paramètres</Text>
        
        <TouchableOpacity style={styles.menuItem}>
          <View style={styles.menuItemLeft}>
            <Ionicons name="notifications-outline" size={24} color="#6366f1" />
            <Text style={styles.menuItemText}>Notifications</Text>
          </View>
          <View style={styles.switchContainer}>
            <Text style={styles.switchText}>Activées</Text>
          </View>
        </TouchableOpacity>

        <TouchableOpacity style={styles.menuItem}>
          <View style={styles.menuItemLeft}>
            <Ionicons name="language-outline" size={24} color="#6366f1" />
            <Text style={styles.menuItemText}>Langue</Text>
          </View>
          <Text style={styles.menuItemValue}>Français</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.menuItem}>
          <View style={styles.menuItemLeft}>
            <Ionicons name="shield-checkmark-outline" size={24} color="#6366f1" />
            <Text style={styles.menuItemText}>Confidentialité</Text>
          </View>
          <Ionicons name="chevron-forward" size={20} color="#ccc" />
        </TouchableOpacity>
      </View>

      <View style={styles.menuSection}>
        <TouchableOpacity
          style={[styles.menuItem, styles.logoutItem]}
          onPress={handleLogout}
        >
          <View style={styles.menuItemLeft}>
            <Ionicons name="log-out-outline" size={24} color="#ef4444" />
            <Text style={[styles.menuItemText, styles.logoutText]}>
              Déconnexion
            </Text>
          </View>
        </TouchableOpacity>
      </View>

      <View style={styles.footer}>
        <Text style={styles.footerText}>
          Shopie - Application de démonstration
        </Text>
        <Text style={styles.versionText}>Version 1.0.0</Text>
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
  profileCard: {
    backgroundColor: 'white',
    margin: 15,
    borderRadius: 15,
    padding: 20,
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
  avatarContainer: {
    marginBottom: 15,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#6366f1',
    justifyContent: 'center',
    alignItems: 'center',
  },
  userInfo: {
    alignItems: 'center',
  },
  userName: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  userEmail: {
    fontSize: 16,
    color: '#666',
    marginBottom: 10,
  },
  roleBadge: {
    backgroundColor: '#f0f9ff',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#6366f1',
  },
  adminBadge: {
    backgroundColor: '#fef3c7',
    borderColor: '#f59e0b',
  },
  roleText: {
    fontSize: 12,
    color: '#6366f1',
    fontWeight: '600',
  },
  adminText: {
    color: '#f59e0b',
  },
  menuSection: {
    backgroundColor: 'white',
    marginHorizontal: 15,
    marginBottom: 15,
    borderRadius: 10,
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
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    padding: 15,
    paddingBottom: 0,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  menuItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  menuItemText: {
    fontSize: 16,
    marginLeft: 15,
    color: '#333',
  },
  menuItemValue: {
    fontSize: 14,
    color: '#666',
  },
  switchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  switchText: {
    fontSize: 14,
    color: '#10b981',
    fontWeight: '600',
  },
  logoutItem: {
    borderBottomWidth: 0,
  },
  logoutText: {
    color: '#ef4444',
  },
  footer: {
    alignItems: 'center',
    padding: 20,
    marginBottom: 20,
  },
  footerText: {
    fontSize: 14,
    color: '#666',
    marginBottom: 5,
  },
  versionText: {
    fontSize: 12,
    color: '#999',
  },
});