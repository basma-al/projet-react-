import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Alert,
  RefreshControl,
  TextInput,
  Modal,
  ScrollView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../context/AuthContext';
import { API_CONFIG, apiRequest } from '../config/api';

export default function AdminUsersScreen({ navigation }) {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [stats, setStats] = useState({
    totalUsers: 0,
    adminCount: 0,
    userCount: 0,
  });
  const [selectedUser, setSelectedUser] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [editForm, setEditForm] = useState({
    nom: '',
    email: '',
    nouveauMotDePasse: '',
  });

  const { user: currentUser, token } = useAuth();

  useEffect(() => {
    if (currentUser?.role !== 'ADMIN') {
      Alert.alert('Accès refusé', 'Vous devez être administrateur pour accéder à cette page');
      navigation.goBack();
      return;
    }
    loadUsers();
    loadStats();
  }, []);

  const loadUsers = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        page: '0',
        size: '50',
        sortBy: 'nom',
        sortDir: 'asc',
      });
      
      if (searchQuery.trim()) {
        params.append('search', searchQuery.trim());
      }

      const response = await apiRequest(`/admin/users?${params}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      setUsers(response.content || []);
    } catch (error) {
      console.error('Error loading users:', error);
      Alert.alert('Erreur', 'Impossible de charger les utilisateurs');
    } finally {
      setLoading(false);
    }
  };

  const loadStats = async () => {
    try {
      const response = await apiRequest('/admin/users/stats', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      setStats(response);
    } catch (error) {
      console.error('Error loading stats:', error);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await Promise.all([loadUsers(), loadStats()]);
    setRefreshing(false);
  };

  const handleSearch = () => {
    loadUsers();
  };

  const showUserDetails = (user) => {
    setSelectedUser(user);
    setModalVisible(true);
  };

  const showEditUser = (user) => {
    setSelectedUser(user);
    setEditForm({
      nom: user.nom,
      email: user.email,
      nouveauMotDePasse: '',
    });
    setEditModalVisible(true);
  };

  const handleUpdateUser = async () => {
    try {
      const updateData = {
        nom: editForm.nom,
        email: editForm.email,
      };

      if (editForm.nouveauMotDePasse.trim()) {
        updateData.nouveauMotDePasse = editForm.nouveauMotDePasse;
      }

      await apiRequest(`/admin/users/${selectedUser.id}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(updateData),
      });

      Alert.alert('Succès', 'Utilisateur modifié avec succès');
      setEditModalVisible(false);
      loadUsers();
    } catch (error) {
      console.error('Error updating user:', error);
      Alert.alert('Erreur', 'Impossible de modifier l\'utilisateur');
    }
  };

  const handleDeleteUser = async (userId) => {
    Alert.alert(
      'Confirmer la suppression',
      'Êtes-vous sûr de vouloir supprimer cet utilisateur ? Cette action est irréversible.',
      [
        { text: 'Annuler', style: 'cancel' },
        {
          text: 'Supprimer',
          style: 'destructive',
          onPress: async () => {
            try {
              await apiRequest(`/admin/users/${userId}`, {
                method: 'DELETE',
                headers: {
                  'Authorization': `Bearer ${token}`,
                },
              });

              Alert.alert('Succès', 'Utilisateur supprimé avec succès');
              loadUsers();
              loadStats();
            } catch (error) {
              console.error('Error deleting user:', error);
              Alert.alert('Erreur', error.message || 'Impossible de supprimer l\'utilisateur');
            }
          },
        },
      ]
    );
  };

  const renderUserItem = ({ item }) => (
    <View style={styles.userCard}>
      <View style={styles.userInfo}>
        <View style={styles.userHeader}>
          <Text style={styles.userName}>{item.nom}</Text>
          <View style={styles.badgeContainer}>
            <View style={[styles.roleBadge, { backgroundColor: item.role === 'ADMIN' ? '#FF9500' : '#007AFF' }]}>
              <Text style={styles.roleText}>{item.role}</Text>
            </View>
            {item.role === 'ADMIN' && (
              <View style={[styles.protectedBadge]}>
                <Ionicons name="shield-checkmark" size={12} color="#34C759" />
                <Text style={styles.protectedText}>Protégé</Text>
              </View>
            )}
          </View>
        </View>
        <Text style={styles.userEmail}>{item.email}</Text>
        <View style={styles.userStats}>
          <Text style={styles.statText}>Commandes: {item.totalOrders || 0}</Text>
          <Text style={styles.statText}>Total dépensé: {(item.totalSpent || 0).toFixed(2)}€</Text>
        </View>
      </View>
      
      <View style={styles.userActions}>
        <TouchableOpacity
          style={[styles.actionButton, { backgroundColor: '#007AFF' }]}
          onPress={() => showUserDetails(item)}
        >
          <Ionicons name="eye" size={16} color="white" />
        </TouchableOpacity>
        
        <TouchableOpacity
          style={[styles.actionButton, { backgroundColor: '#34C759' }]}
          onPress={() => showEditUser(item)}
        >
          <Ionicons name="pencil" size={16} color="white" />
        </TouchableOpacity>
        
        {/* Masquer le bouton de changement de rôle car il ne peut y avoir qu'un seul admin */}
        
        {item.id !== currentUser?.id && item.role !== 'ADMIN' && (
          <TouchableOpacity
            style={[styles.actionButton, { backgroundColor: '#FF3B30' }]}
            onPress={() => handleDeleteUser(item.id)}
          >
            <Ionicons name="trash" size={16} color="white" />
          </TouchableOpacity>
        )}
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      {/* Header avec statistiques */}
      <View style={styles.header}>
        <Text style={styles.title}>Gestion des Utilisateurs</Text>
        <Text style={styles.subtitle}>Il ne peut y avoir qu'un seul administrateur dans le système</Text>
        <View style={styles.statsContainer}>
          <View style={styles.statCard}>
            <Text style={styles.statNumber}>{stats.totalUsers}</Text>
            <Text style={styles.statLabel}>Total</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statNumber}>{stats.adminCount}</Text>
            <Text style={styles.statLabel}>Admin</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statNumber}>{stats.userCount}</Text>
            <Text style={styles.statLabel}>Utilisateurs</Text>
          </View>
        </View>
      </View>

      {/* Barre de recherche */}
      <View style={styles.searchContainer}>
        <TextInput
          style={styles.searchInput}
          placeholder="Rechercher par nom ou email..."
          value={searchQuery}
          onChangeText={setSearchQuery}
          onSubmitEditing={handleSearch}
        />
        <TouchableOpacity style={styles.searchButton} onPress={handleSearch}>
          <Ionicons name="search" size={20} color="white" />
        </TouchableOpacity>
      </View>

      {/* Liste des utilisateurs */}
      <FlatList
        data={users}
        renderItem={renderUserItem}
        keyExtractor={(item) => item.id.toString()}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        contentContainerStyle={styles.listContainer}
        showsVerticalScrollIndicator={false}
      />

      {/* Modal détails utilisateur */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Détails de l'utilisateur</Text>
              <TouchableOpacity onPress={() => setModalVisible(false)}>
                <Ionicons name="close" size={24} color="#666" />
              </TouchableOpacity>
            </View>
            
            {selectedUser && (
              <ScrollView style={styles.modalBody}>
                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>Nom:</Text>
                  <Text style={styles.detailValue}>{selectedUser.nom}</Text>
                </View>
                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>Email:</Text>
                  <Text style={styles.detailValue}>{selectedUser.email}</Text>
                </View>
                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>Rôle:</Text>
                  <Text style={styles.detailValue}>{selectedUser.role}</Text>
                </View>
                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>Commandes:</Text>
                  <Text style={styles.detailValue}>{selectedUser.totalOrders || 0}</Text>
                </View>
                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>Total dépensé:</Text>
                  <Text style={styles.detailValue}>{(selectedUser.totalSpent || 0).toFixed(2)}€</Text>
                </View>
                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>Statut:</Text>
                  <Text style={styles.detailValue}>{selectedUser.enabled ? 'Actif' : 'Inactif'}</Text>
                </View>
              </ScrollView>
            )}
          </View>
        </View>
      </Modal>

      {/* Modal édition utilisateur */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={editModalVisible}
        onRequestClose={() => setEditModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Modifier l'utilisateur</Text>
              <TouchableOpacity onPress={() => setEditModalVisible(false)}>
                <Ionicons name="close" size={24} color="#666" />
              </TouchableOpacity>
            </View>
            
            <ScrollView style={styles.modalBody}>
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Nom</Text>
                <TextInput
                  style={styles.input}
                  value={editForm.nom}
                  onChangeText={(text) => setEditForm({ ...editForm, nom: text })}
                  placeholder="Nom de l'utilisateur"
                />
              </View>
              
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Email</Text>
                <TextInput
                  style={styles.input}
                  value={editForm.email}
                  onChangeText={(text) => setEditForm({ ...editForm, email: text })}
                  placeholder="Email de l'utilisateur"
                  keyboardType="email-address"
                />
              </View>
              
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Nouveau mot de passe (optionnel)</Text>
                <TextInput
                  style={styles.input}
                  value={editForm.nouveauMotDePasse}
                  onChangeText={(text) => setEditForm({ ...editForm, nouveauMotDePasse: text })}
                  placeholder="Laisser vide pour ne pas changer"
                  secureTextEntry
                />
              </View>
              
              <TouchableOpacity style={styles.saveButton} onPress={handleUpdateUser}>
                <Text style={styles.saveButtonText}>Sauvegarder</Text>
              </TouchableOpacity>
            </ScrollView>
          </View>
        </View>
      </Modal>
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
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 14,
    color: '#666',
    marginBottom: 16,
    fontStyle: 'italic',
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  statCard: {
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#007AFF',
  },
  statLabel: {
    fontSize: 12,
    color: '#666',
    marginTop: 4,
  },
  searchContainer: {
    flexDirection: 'row',
    padding: 16,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  searchInput: {
    flex: 1,
    height: 40,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    paddingHorizontal: 12,
    marginRight: 8,
  },
  searchButton: {
    backgroundColor: '#007AFF',
    borderRadius: 8,
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  listContainer: {
    padding: 16,
  },
  userCard: {
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
  userInfo: {
    flex: 1,
  },
  userHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  userName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    flex: 1,
  },
  badgeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  roleBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  roleText: {
    color: 'white',
    fontSize: 10,
    fontWeight: 'bold',
  },
  protectedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#E8F5E8',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 8,
    gap: 2,
  },
  protectedText: {
    color: '#34C759',
    fontSize: 9,
    fontWeight: 'bold',
  },
  userEmail: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
  },
  userStats: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  statText: {
    fontSize: 12,
    color: '#999',
  },
  userActions: {
    flexDirection: 'row',
    gap: 8,
  },
  actionButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: 'white',
    borderRadius: 12,
    width: '90%',
    maxHeight: '80%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  modalBody: {
    padding: 20,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  detailLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
  },
  detailValue: {
    fontSize: 14,
    color: '#666',
  },
  inputGroup: {
    marginBottom: 16,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
  },
  saveButton: {
    backgroundColor: '#007AFF',
    borderRadius: 8,
    padding: 16,
    alignItems: 'center',
    marginTop: 16,
  },
  saveButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
});