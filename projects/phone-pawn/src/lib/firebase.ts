import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyB_Txpg1_4OMQtuGFT7UhaboRpk-HW3HrA",
  authDomain: "ple-openclaw.firebaseapp.com",
  projectId: "ple-openclaw",
  storageBucket: "ple-openclaw.firebasestorage.app",
  messagingSenderId: "548686522455",
  appId: "1:548686522455:web:4696b42f730fed5da19b12"
};

export const isFirebaseConfigured = true;

export const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
