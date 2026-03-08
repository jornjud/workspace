import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';
import { getFunctions } from 'firebase/functions';

// Firebase configuration - ใช้จาก Firebase Console
const firebaseConfig = {
  apiKey: "AIzaSyBO9GZKhHfjNKEBbjH_kR5V5iJPZ5pZ5pI",
  authDomain: "ple-openclaw.firebaseapp.com",
  projectId: "ple-openclaw",
  storageBucket: "ple-openclaw.appspot.com",
  messagingSenderId: "123456789012",
  appId: "1:123456789012:web:abcdef1234567890"
};

// Initialize Firebase
export const app = initializeApp(firebaseConfig);

// Firebase Services
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);
export const functions = getFunctions(app);
