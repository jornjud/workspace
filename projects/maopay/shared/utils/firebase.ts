import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';
import { getFunctions } from 'firebase/functions';

// Firebase configuration
const firebaseConfig = {
  apiKey: "YOUR_API_KEY",
  authDomain: "YOUR_PROJECT.firebaseapp.com",
  projectId: "YOUR_PROJECT",
  storageBucket: "YOUR_PROJECT.appspot.com",
  messagingSenderId: "YOUR_SENDER_ID",
  appId: "YOUR_APP_ID"
};

// Initialize Firebase
export const app = initializeApp(firebaseConfig);

// Firebase Services
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);
export const functions = getFunctions(app);

// API Functions (callable)
export const api = {
  // Auth
  createUser: (data) => functions.httpsCallable('createUser')(data),
  getUser: (data) => functions.httpsCallable('getUser')(data),
  
  // Restaurants
  getRestaurants: (data) => functions.httpsCallable('getRestaurants')(data),
  getRestaurant: (data) => functions.httpsCallable('getRestaurant')(data),
  
  // Orders
  createOrder: (data) => functions.httpsCallable('createOrder')(data),
  getOrder: (data) => functions.httpsCallable('getOrder')(data),
  getCustomerOrders: (data) => functions.httpsCallable('getCustomerOrders')(data),
  updateOrderStatus: (data) => functions.httpsCallable('updateOrderStatus')(data),
  
  // Driver
  getAvailableOrders: () => functions.httpsCallable('getAvailableOrders')(),
  acceptOrder: (data) => functions.httpsCallable('acceptOrder')(data),
  
  // Payment
  createPayment: (data) => functions.httpsCallable('createPayment')(data),
  confirmPayment: (data) => functions.httpsCallable('confirmPayment')(data),
  
  // Analytics
  getDailyStats: (data) => functions.httpsCallable('getDailyStats')(data),
  
  // Health
  healthCheck: () => functions.httpsCallable('healthCheck')(),
};
