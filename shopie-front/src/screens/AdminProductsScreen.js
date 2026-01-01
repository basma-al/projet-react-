import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  TouchableOpacity,
  Alert,
  RefreshControl,
  Modal,
  TextInput,
  ScrollView,
  Image,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { API_CONFIG } from '../config/api';

export default function AdminProductsScreen({ navigation }) {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [formData, setFormData] = useState({
    nom: '',
    description: '',
    prix: '',
    imageUrl: '',
    stock: '',
  });
  const [selectedImage, setSelectedImage] = useState(null);
  const [uploadingImage, setUploadingImage] = useState(false);

  const { authenticatedRequest, user, token } = useAuth();
  const { getCartItemsCount } = useCart();

  useEffect(() => {
    if (user?.role !== 'ADMIN') {
      Alert.alert('Accès refusé', 'Vous devez être administrateur pour accéder à cette page');
      navigation.goBack();
      return;
    }
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

  const onRefresh = async () => {
    setRefreshing(true);
    await loadProducts();
    setRefreshing(false);
  };

  const openCreateModal = () => {
    setEditingProduct(null);
    setFormData({
      nom: '',
      description: '',
      prix: '',
      imageUrl: '',
      stock: '',
    });
    setSelectedImage(null);
    setModalVisible(true);
  };

  const openEditModal = (product) => {
    setEditingProduct(product);
    setFormData({
      nom: product.nom,
      description: product.description || '',
      prix: product.prix.toString(),
      imageUrl: product.imageUrl || '',
      stock: product.stock.toString(),
    });
    setSelectedImage(null);
    setModalVisible(true);
  };

  const handleSaveProduct = async () => {
    if (!formData.nom.trim() || !formData.prix.trim() || !formData.stock.trim()) {
      Alert.alert('Erreur', 'Veuillez remplir tous les champs obligatoires');
      return;
    }

    let finalImageUrl = formData.imageUrl;

    // Si une nouvelle image a été sélectionnée, l'uploader d'abord
    if (selectedImage) {
      try {
        setUploadingImage(true);
        finalImageUrl = await uploadImage(selectedImage);
      } catch (error) {
        Alert.alert('Erreur', 'Impossible d\'uploader l\'image: ' + error.message);
        setUploadingImage(false);
        return;
      }
      setUploadingImage(false);
    }

    const productData = {
      nom: formData.nom.trim(),
      description: formData.description.trim(),
      prix: parseFloat(formData.prix),
      imageUrl: finalImageUrl || null,
      stock: parseInt(formData.stock),
    };

    try {
      if (editingProduct) {
        // Modifier le produit
        await authenticatedRequest(`${API_CONFIG.ENDPOINTS.PRODUCT_UPDATE}/${editingProduct.id}`, {
          method: 'PUT',
          body: JSON.stringify(productData),
        });
        Alert.alert('Succès', 'Produit modifié avec succès');
      } else {
        // Créer un nouveau produit
        await authenticatedRequest(API_CONFIG.ENDPOINTS.PRODUCT_CREATE, {
          method: 'POST',
          body: JSON.stringify(productData),
        });
        Alert.alert('Succès', 'Produit créé avec succès');
      }
      
      setModalVisible(false);
      loadProducts();
    } catch (error) {
      console.error('Error saving product:', error);
      Alert.alert('Erreur', 'Impossible de sauvegarder le produit');
    }
  };

  // Fonction pour uploader une image
  const uploadImage = async (imageUri) => {
    try {
      const formData = new FormData();
      formData.append('file', {
        uri: imageUri,
        type: 'image/jpeg',
        name: 'product-image.jpg',
      });

      const response = await fetch(`${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.IMAGE_UPLOAD}`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'multipart/form-data',
        },
        body: formData,
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      return `${API_CONFIG.BASE_URL}${result.imageUrl}`;
    } catch (error) {
      console.error('Error uploading image:', error);
      throw error;
    }
  };

  // Fonction pour sélectionner une image depuis la galerie
  const pickImageFromGallery = async () => {
    try {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission requise', 'Nous avons besoin de la permission pour accéder à vos photos');
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });

      if (!result.canceled && result.assets[0]) {
        setSelectedImage(result.assets[0].uri);
        setFormData({ ...formData, imageUrl: '' }); // Clear URL field when image is selected
      }
    } catch (error) {
      Alert.alert('Erreur', 'Impossible de sélectionner l\'image');
    }
  };

  // Fonction pour prendre une photo avec la caméra
  const takePhoto = async () => {
    try {
      const { status } = await ImagePicker.requestCameraPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission requise', 'Nous avons besoin de la permission pour utiliser la caméra');
        return;
      }

      const result = await ImagePicker.launchCameraAsync({
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });

      if (!result.canceled && result.assets[0]) {
        setSelectedImage(result.assets[0].uri);
        setFormData({ ...formData, imageUrl: '' }); // Clear URL field when image is selected
      }
    } catch (error) {
      Alert.alert('Erreur', 'Impossible de prendre la photo');
    }
  };

  // Fonction pour choisir la méthode d'ajout d'image
  const showImageOptions = () => {
    Alert.alert(
      'Ajouter une image',
      'Comment souhaitez-vous ajouter une image ?',
      [
        { text: 'Galerie', onPress: pickImageFromGallery },
        { text: 'Caméra', onPress: takePhoto },
        { text: 'URL', onPress: () => {} }, // L'utilisateur peut toujours utiliser le champ URL
        { text: 'Annuler', style: 'cancel' },
      ]
    );
  };

  const handleDeleteProduct = (product) => {
    Alert.alert(
      'Confirmer la suppression',
      `Êtes-vous sûr de vouloir supprimer "${product.nom}" ?`,
      [
        { text: 'Annuler', style: 'cancel' },
        {
          text: 'Supprimer',
          style: 'destructive',
          onPress: () => deleteProduct(product.id),
        },
      ]
    );
  };

  const deleteProduct = async (productId) => {
    try {
      console.log('Attempting to delete product:', productId);
      console.log('User role:', user?.role);
      console.log('Token exists:', !!token);
      
      const response = await authenticatedRequest(`${API_CONFIG.ENDPOINTS.PRODUCT_DELETE}/${productId}`, {
        method: 'DELETE',
      });
      
      console.log('Delete response:', response);
      Alert.alert('Succès', 'Produit supprimé avec succès');
      loadProducts();
    } catch (error) {
      console.error('Error deleting product:', error);
      Alert.alert('Erreur', `Impossible de supprimer le produit: ${error.message}`);
    }
  };

  const renderProduct = ({ item }) => (
    <View style={styles.productCard}>
      <View style={styles.productInfo}>
        <Text style={styles.productName}>{item.nom}</Text>
        <Text style={styles.productDescription} numberOfLines={2}>
          {item.description || 'Aucune description'}
        </Text>
        <Text style={styles.productPrice}>{item.prix}€</Text>
        <Text style={styles.productStock}>Stock: {item.stock}</Text>
      </View>
      <View style={styles.productActions}>
        <TouchableOpacity
          style={[styles.actionButton, styles.editButton]}
          onPress={() => openEditModal(item)}
        >
          <Ionicons name="pencil" size={20} color="white" />
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.actionButton, styles.deleteButton]}
          onPress={() => handleDeleteProduct(item)}
        >
          <Ionicons name="trash" size={20} color="white" />
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Gestion des Produits</Text>
        <View style={styles.headerActions}>
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
          <TouchableOpacity style={styles.addButton} onPress={openCreateModal}>
            <Ionicons name="add" size={24} color="white" />
          </TouchableOpacity>
        </View>
      </View>

      <FlatList
        data={products}
        renderItem={renderProduct}
        keyExtractor={(item) => item.id.toString()}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        contentContainerStyle={styles.listContainer}
        showsVerticalScrollIndicator={false}
      />

      {/* Modal pour créer/modifier un produit */}
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
                  {editingProduct ? 'Modifier le produit' : 'Nouveau produit'}
                </Text>
                <TouchableOpacity onPress={() => setModalVisible(false)}>
                  <Ionicons name="close" size={24} color="#666" />
                </TouchableOpacity>
              </View>

              <View style={styles.formGroup}>
                <Text style={styles.label}>Nom du produit *</Text>
                <TextInput
                  style={styles.input}
                  value={formData.nom}
                  onChangeText={(text) => setFormData({ ...formData, nom: text })}
                  placeholder="Nom du produit"
                />
              </View>

              <View style={styles.formGroup}>
                <Text style={styles.label}>Description</Text>
                <TextInput
                  style={[styles.input, styles.textArea]}
                  value={formData.description}
                  onChangeText={(text) => setFormData({ ...formData, description: text })}
                  placeholder="Description du produit"
                  multiline
                  numberOfLines={3}
                />
              </View>

              <View style={styles.formGroup}>
                <Text style={styles.label}>Prix (€) *</Text>
                <TextInput
                  style={styles.input}
                  value={formData.prix}
                  onChangeText={(text) => setFormData({ ...formData, prix: text })}
                  placeholder="0.00"
                  keyboardType="decimal-pad"
                />
              </View>

              <View style={styles.formGroup}>
                <Text style={styles.label}>Image du produit</Text>
                
                {/* Prévisualisation de l'image */}
                <View style={styles.imagePreviewContainer}>
                  {selectedImage ? (
                    <Image source={{ uri: selectedImage }} style={styles.imagePreview} />
                  ) : formData.imageUrl ? (
                    <Image 
                      source={{ uri: formData.imageUrl }} 
                      style={styles.imagePreview}
                      defaultSource={{ uri: 'https://via.placeholder.com/150x150?text=No+Image' }}
                    />
                  ) : (
                    <View style={styles.imagePlaceholder}>
                      <Ionicons name="image-outline" size={40} color="#ccc" />
                      <Text style={styles.imagePlaceholderText}>Aucune image</Text>
                    </View>
                  )}
                </View>

                {/* Boutons pour ajouter/changer l'image */}
                <View style={styles.imageButtonsContainer}>
                  <TouchableOpacity
                    style={styles.imageButton}
                    onPress={showImageOptions}
                    disabled={uploadingImage}
                  >
                    <Ionicons name="camera" size={20} color="#6366f1" />
                    <Text style={styles.imageButtonText}>
                      {selectedImage || formData.imageUrl ? 'Changer' : 'Ajouter'} image
                    </Text>
                  </TouchableOpacity>
                  
                  {(selectedImage || formData.imageUrl) && (
                    <TouchableOpacity
                      style={[styles.imageButton, styles.removeImageButton]}
                      onPress={() => {
                        setSelectedImage(null);
                        setFormData({ ...formData, imageUrl: '' });
                      }}
                    >
                      <Ionicons name="trash-outline" size={20} color="#ef4444" />
                      <Text style={[styles.imageButtonText, { color: '#ef4444' }]}>
                        Supprimer
                      </Text>
                    </TouchableOpacity>
                  )}
                </View>

                {uploadingImage && (
                  <View style={styles.uploadingContainer}>
                    <Text style={styles.uploadingText}>Upload en cours...</Text>
                  </View>
                )}
              </View>

              <View style={styles.formGroup}>
                <Text style={styles.label}>Ou URL de l'image</Text>
                <TextInput
                  style={styles.input}
                  value={formData.imageUrl}
                  onChangeText={(text) => {
                    setFormData({ ...formData, imageUrl: text });
                    if (text.trim()) {
                      setSelectedImage(null); // Clear selected image when URL is entered
                    }
                  }}
                  placeholder="https://example.com/image.jpg"
                  editable={!selectedImage}
                />
                {selectedImage && (
                  <Text style={styles.helperText}>
                    Une image est sélectionnée. Supprimez-la pour utiliser une URL.
                  </Text>
                )}
              </View>

              <View style={styles.formGroup}>
                <Text style={styles.label}>Stock *</Text>
                <TextInput
                  style={styles.input}
                  value={formData.stock}
                  onChangeText={(text) => setFormData({ ...formData, stock: text })}
                  placeholder="0"
                  keyboardType="number-pad"
                />
              </View>

              <View style={styles.modalActions}>
                <TouchableOpacity
                  style={[styles.modalButton, styles.cancelButton]}
                  onPress={() => setModalVisible(false)}
                >
                  <Text style={styles.cancelButtonText}>Annuler</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.modalButton, styles.saveButton]}
                  onPress={handleSaveProduct}
                >
                  <Text style={styles.saveButtonText}>
                    {editingProduct ? 'Modifier' : 'Créer'}
                  </Text>
                </TouchableOpacity>
              </View>
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
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
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
  addButton: {
    backgroundColor: '#007AFF',
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
  },
  listContainer: {
    padding: 16,
  },
  productCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  productInfo: {
    flex: 1,
  },
  productName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  productDescription: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
  },
  productPrice: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#007AFF',
    marginBottom: 4,
  },
  productStock: {
    fontSize: 14,
    color: '#888',
  },
  productActions: {
    flexDirection: 'row',
    gap: 8,
  },
  actionButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  editButton: {
    backgroundColor: '#34C759',
  },
  deleteButton: {
    backgroundColor: '#FF3B30',
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
  formGroup: {
    marginBottom: 16,
  },
  label: {
    fontSize: 16,
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
    backgroundColor: '#f9f9f9',
  },
  textArea: {
    height: 80,
    textAlignVertical: 'top',
  },
  modalActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 20,
    gap: 12,
  },
  modalButton: {
    flex: 1,
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  cancelButton: {
    backgroundColor: '#f0f0f0',
  },
  cancelButtonText: {
    color: '#666',
    fontSize: 16,
    fontWeight: '600',
  },
  saveButton: {
    backgroundColor: '#007AFF',
  },
  saveButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  imagePreviewContainer: {
    alignItems: 'center',
    marginBottom: 12,
  },
  imagePreview: {
    width: 120,
    height: 120,
    borderRadius: 8,
    resizeMode: 'cover',
  },
  imagePlaceholder: {
    width: 120,
    height: 120,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: '#ddd',
    borderStyle: 'dashed',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f9f9f9',
  },
  imagePlaceholderText: {
    color: '#ccc',
    fontSize: 12,
    marginTop: 4,
  },
  imageButtonsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 12,
    marginBottom: 8,
  },
  imageButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#6366f1',
    backgroundColor: 'white',
  },
  removeImageButton: {
    borderColor: '#ef4444',
  },
  imageButtonText: {
    color: '#6366f1',
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 6,
  },
  uploadingContainer: {
    alignItems: 'center',
    paddingVertical: 8,
  },
  uploadingText: {
    color: '#6366f1',
    fontSize: 14,
    fontStyle: 'italic',
  },
  helperText: {
    fontSize: 12,
    color: '#666',
    marginTop: 4,
    fontStyle: 'italic',
  },
});