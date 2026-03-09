import { 
  collection, 
  doc, 
  getDocs, 
  getDoc, 
  addDoc, 
  updateDoc, 
  deleteDoc,
  query,
  where,
  orderBy
} from "firebase/firestore";
import { db } from "./firebase";

export interface Phone {
  id: string;
  code: string; // รหัสสินค้า เช่น SP-001
  model: string;
  storage: string;
  color: string;
  price: number;
  condition: string;
  conditionNote: string;
  images: string[];
  specs: string;
  year: number;
  addedAt: string;
  status: string;
  hidden: boolean;
}

const COLLECTION_NAME = "phones";

// Get all phones
export async function getAllPhones(): Promise<Phone[]> {
  const querySnapshot = await getDocs(collection(db, COLLECTION_NAME));
  return querySnapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data()
  })) as Phone[];
}

// Get visible phones only (not hidden)
export async function getVisiblePhones(): Promise<Phone[]> {
  const q = query(
    collection(db, COLLECTION_NAME),
    where("hidden", "==", false)
  );
  const querySnapshot = await getDocs(q);
  return querySnapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data()
  })) as Phone[];
}

// Get phone by ID
export async function getPhoneById(id: string): Promise<Phone | null> {
  const docRef = doc(db, COLLECTION_NAME, id);
  const docSnap = await getDoc(docRef);
  if (docSnap.exists()) {
    return { id: docSnap.id, ...docSnap.data() } as Phone;
  }
  return null;
}

// Add new phone
export async function addPhone(phone: Omit<Phone, "id">): Promise<string> {
  const docRef = await addDoc(collection(db, COLLECTION_NAME), {
    ...phone,
    addedAt: phone.addedAt || new Date().toISOString()
  });
  return docRef.id;
}

// Update phone
export async function updatePhone(id: string, phone: Partial<Phone>): Promise<void> {
  const docRef = doc(db, COLLECTION_NAME, id);
  await updateDoc(docRef, phone);
}

// Delete phone
export async function deletePhone(id: string): Promise<void> {
  const docRef = doc(db, COLLECTION_NAME, id);
  await deleteDoc(docRef);
}

// Import multiple phones (for initial setup)
export async function importPhones(phones: Omit<Phone, "id">[]): Promise<void> {
  for (const phone of phones) {
    await addDoc(collection(db, COLLECTION_NAME), {
      ...phone,
      addedAt: phone.addedAt || new Date().toISOString()
    });
  }
}
