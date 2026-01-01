// API Configuration for Shopie Backend
const getBaseUrl = () => {
  // For Android emulator, use 10.0.2.2
  // For iOS simulator, use localhost
  // For physical device, use your computer's IP address
  
  // You can uncomment the appropriate line based on your setup:
  return 'http://192.168.1.113:8081/api';        // Physical device/Expo Go
  // return 'http://10.0.2.2:8081/api';       // Android emulator
  // return 'http://localhost:8081/api';      // iOS simulator
};

export const API_CONFIG = {
  BASE_URL: getBaseUrl(),
  
  ENDPOINTS: {
    // Auth
    LOGIN: '/auth/login',
    REGISTER: '/auth/register',
    
    // Products
    PRODUCTS: '/products',
    PRODUCT_SEARCH: '/products/search',
    PRODUCT_CREATE: '/products',
    PRODUCT_UPDATE: '/products',
    PRODUCT_DELETE: '/products',
    
    // Cart
    CART: '/cart',
    
    // Orders
    ORDERS: '/orders',
    ADMIN_ORDERS_ALL: '/orders/admin/all',
    ADMIN_ORDERS_STATUS: '/orders/admin/status',
    ADMIN_ORDER_UPDATE_STATUS: '/orders/admin',
    
    // Payments
    PAYMENTS: '/payments',
    
    // Images
    IMAGE_UPLOAD: '/images/upload',
    IMAGE_GET: '/images',
    IMAGE_DELETE: '/images',
  }
};

// Default headers for API requests
export const getHeaders = (token = null) => {
  const headers = {
    'Content-Type': 'application/json',
  };
  
  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }
  
  return headers;
};

// API request helper with better error handling
export const apiRequest = async (endpoint, options = {}) => {
  const url = `${API_CONFIG.BASE_URL}${endpoint}`;
  
  try {
    console.log(`API Request: ${options.method || 'GET'} ${url}`);
    
    const response = await fetch(url, {
      ...options,
      headers: {
        ...getHeaders(),
        ...options.headers,
      },
    });

    if (!response.ok) {
      let errorMessage = `HTTP error! status: ${response.status}`;
      try {
        const errorData = await response.text();
        if (errorData) {
          errorMessage = errorData;
        }
      } catch (e) {
        // If we can't parse the error, use the status
      }
      throw new Error(errorMessage);
    }

    // Check if response has content before trying to parse JSON
    const contentType = response.headers.get('content-type');
    const contentLength = response.headers.get('content-length');
    
    if (contentLength === '0' || !contentType?.includes('application/json')) {
      // Return empty object for successful requests with no content (like DELETE)
      console.log(`API Response: ${url} - No content (${response.status})`);
      return {};
    }

    const data = await response.json();
    console.log(`API Response: ${url}`, data);
    return data;
  } catch (error) {
    console.error('API Request Error:', error);
    throw error;
  }
};