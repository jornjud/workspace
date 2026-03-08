import { initializeApp, getApps, getApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
  apiKey: "AIzaSyAzZjdxoAJYI0q_ai7gIa-G4qFqKB7st3s",
  authDomain: "secondphone-fe9a9.firebaseapp.com",
  projectId: "secondphone-fe9a9",
  storageBucket: "secondphone-fe9a9.firebasestorage.app",
  messagingSenderId: "619983782470",
  appId: "1:619983782470:web:d2394c5658fdf3abae8047"
};

const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();
export const db = getFirestore(app);
export const storage = getStorage(app);
