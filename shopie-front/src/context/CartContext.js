import React, { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from './AuthContext';
import { API_CONFIG } from '../config/api';

const CartContext = createContext();

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};

export const CartProvider = ({ children }) => {
  const [cartItems, setCartItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const { authenticatedRequest, user } = useAuth();

  useEffect(() => {
    if (user) {
      loadCart();
    } else {
      setCartItems([]);
    }
  }, [user]);

  const loadCart = async () => {
    try {
      setLoading(true);
      const response = await authenticatedRequest(API_CONFIG.ENDPOINTS.CART);
      setCartItems(response || []);
    } catch (error) {
      console.error('Error loading cart:', error);
      setCartItems([]);
    } finally {
      setLoading(false);
    }
  };

  const addToCart = async (productId, quantite = 1) => {
    try {
      await authenticatedRequest(API_CONFIG.ENDPOINTS.CART, {
        method: 'POST',
        body: JSON.stringify({ productId, quantite }),
      });
      await loadCart(); // Refresh cart
      return { success: true };
    } catch (error) {
      console.error('Error adding to cart:', error);
      return { success: false, error: error.message };
    }
  };

  const updateCartItem = async (cartItemId, quantite) => {
    try {
      await authenticatedRequest(`${API_CONFIG.ENDPOINTS.CART}/${cartItemId}?quantite=${quantite}`, {
        method: 'PUT',
      });
      await loadCart(); // Refresh cart
      return { success: true };
    } catch (error) {
      console.error('Error updating cart item:', error);
      return { success: false, error: error.message };
    }
  };

  const removeFromCart = async (cartItemId) => {
    try {
      await authenticatedRequest(`${API_CONFIG.ENDPOINTS.CART}/${cartItemId}`, {
        method: 'DELETE',
      });
      await loadCart(); // Refresh cart
      return { success: true };
    } catch (error) {
      console.error('Error removing from cart:', error);
      return { success: false, error: error.message };
    }
  };

  const clearCart = async () => {
    try {
      await authenticatedRequest(API_CONFIG.ENDPOINTS.CART, {
        method: 'DELETE',
      });
      setCartItems([]);
      return { success: true };
    } catch (error) {
      console.error('Error clearing cart:', error);
      return { success: false, error: error.message };
    }
  };

  const getCartTotal = () => {
    return cartItems.reduce((total, item) => {
      return total + (item.product?.prix || 0) * item.quantite;
    }, 0);
  };

  const getCartItemsCount = () => {
    return cartItems.reduce((total, item) => total + item.quantite, 0);
  };

  const isProductInCart = (productId) => {
    return cartItems.find(item => item.product?.id === productId);
  };

  const getProductQuantityInCart = (productId) => {
    const cartItem = cartItems.find(item => item.product?.id === productId);
    return cartItem ? cartItem.quantite : 0;
  };

  const removeProductFromCart = async (productId) => {
    const cartItem = cartItems.find(item => item.product?.id === productId);
    if (cartItem) {
      return await removeFromCart(cartItem.id);
    }
    return { success: false, error: 'Produit non trouvé dans le panier' };
  };

  const value = {
    cartItems,
    loading,
    addToCart,
    updateCartItem,
    removeFromCart,
    clearCart,
    loadCart,
    getCartTotal,
    getCartItemsCount,
    isProductInCart,
    getProductQuantityInCart,
    removeProductFromCart,
  };

  return (
    <CartContext.Provider value={value}>
      {children}
    </CartContext.Provider>
  );
};