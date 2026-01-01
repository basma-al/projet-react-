import React, { useEffect, useState } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { StatusBar } from 'expo-status-bar';

// Screens
import LoginScreen from './src/screens/LoginScreen';
import RegisterScreen from './src/screens/RegisterScreen';
import HomeScreen from './src/screens/HomeScreen';
import ProductDetailScreen from './src/screens/ProductDetailScreen';
import CartScreen from './src/screens/CartScreen';
import OrdersScreen from './src/screens/OrdersScreen';
import OrderDetailScreen from './src/screens/OrderDetailScreen';
import ProfileScreen from './src/screens/ProfileScreen';
import CheckoutScreen from './src/screens/CheckoutScreen';
import AdminDashboardScreen from './src/screens/AdminDashboardScreen';
import AdminProductsScreen from './src/screens/AdminProductsScreen';
import AdminOrdersScreen from './src/screens/AdminOrdersScreen';
import AdminUsersScreen from './src/screens/AdminUsersScreen';

// Context
import { AuthProvider, useAuth } from './src/context/AuthContext';
import { CartProvider } from './src/context/CartContext';

const Stack = createStackNavigator();
const Tab = createBottomTabNavigator();

function TabNavigator() {
  const { user } = useAuth();
  const isAdmin = user?.role === 'ADMIN';

  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let iconName;
          if (route.name === 'Accueil') {
            iconName = focused ? 'home' : 'home-outline';
          } else if (route.name === 'Panier') {
            iconName = focused ? 'cart' : 'cart-outline';
          } else if (route.name === 'Commandes') {
            iconName = focused ? 'list' : 'list-outline';
          } else if (route.name === 'Profil') {
            iconName = focused ? 'person' : 'person-outline';
          } else if (route.name === 'Admin') {
            iconName = focused ? 'settings' : 'settings-outline';
          }
          return <Ionicons name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: '#6366f1',
        tabBarInactiveTintColor: 'gray',
        headerShown: false,
      })}
    >
      <Tab.Screen name="Accueil" component={HomeScreen} />
      <Tab.Screen name="Panier" component={CartScreen} />
      <Tab.Screen name="Commandes" component={OrdersScreen} />
      <Tab.Screen name="Profil" component={ProfileScreen} />
      {isAdmin && (
        <Tab.Screen 
          name="Admin" 
          component={AdminDashboardScreen}
          options={{ title: 'Administration' }}
        />
      )}
    </Tab.Navigator>
  );
}

function AuthStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Login" component={LoginScreen} />
      <Stack.Screen name="Register" component={RegisterScreen} />
    </Stack.Navigator>
  );
}

function AppStack() {
  return (
    <Stack.Navigator>
      <Stack.Screen 
        name="Main" 
        component={TabNavigator} 
        options={{ headerShown: false }}
      />
      <Stack.Screen 
        name="ProductDetail" 
        component={ProductDetailScreen}
        options={{ title: 'Détails du produit' }}
      />
      <Stack.Screen 
        name="OrderDetail" 
        component={OrderDetailScreen}
        options={{ title: 'Détails de la commande' }}
      />
      <Stack.Screen 
        name="Checkout" 
        component={CheckoutScreen}
        options={{ title: 'Commande' }}
      />
      <Stack.Screen 
        name="AdminProducts" 
        component={AdminProductsScreen}
        options={{ title: 'Gestion des Produits' }}
      />
      <Stack.Screen 
        name="AdminOrders" 
        component={AdminOrdersScreen}
        options={{ title: 'Gestion des Commandes' }}
      />
      <Stack.Screen 
        name="AdminUsers" 
        component={AdminUsersScreen}
        options={{ title: 'Gestion des Utilisateurs' }}
      />
    </Stack.Navigator>
  );
}

function AppNavigator() {
  const { user, loading } = useAuth();

  if (loading) {
    return null; // You could add a loading screen here
  }

  return (
    <NavigationContainer>
      {user ? <AppStack /> : <AuthStack />}
    </NavigationContainer>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <CartProvider>
        <StatusBar style="auto" />
        <AppNavigator />
      </CartProvider>
    </AuthProvider>
  );
}