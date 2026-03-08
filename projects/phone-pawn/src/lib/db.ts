import { collection, addDoc, getDocs, doc, updateDoc, query, where, getDoc, orderBy } from "firebase/firestore";
import { db } from "./firebase";

export interface RenewalEntry {
  renewalDate: string;
  interestPaid: number;
  previousDueDate: string;
  newDueDate: string;
}

export interface PawnRecord {
  id: string;
  refId: string;
  customerName: string;
  phoneModel: string;
  ramRom: string;
  imei?: string;
  pin?: string;
  principal: number;
  startDate: string; // ISO string
  dueDate: string; // ISO string
  lastPaymentDate: string; // ISO string
  status: 'active' | 'redeemed' | 'expired';
  renewalHistory?: RenewalEntry[];
  createdAt: string;
}

export async function getPawns(): Promise<PawnRecord[]> {
  if (!db) return [];
  const q = query(collection(db, "pawns"), orderBy("createdAt", "desc"));
  const querySnapshot = await getDocs(q);
  return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as PawnRecord));
}

export async function addPawn(pawn: Omit<PawnRecord, 'id'>) {
  if (!db) return;
  await addDoc(collection(db, "pawns"), pawn);
}

export async function updatePawn(id: string, data: Partial<PawnRecord>) {
  if (!db) return;
  const pawnRef = doc(db, "pawns", id);
  await updateDoc(pawnRef, data);
}

export async function deletePawn(id: string) {
  if (!db) return;
  const { deleteDoc } = await import("firebase/firestore");
  const pawnRef = doc(db, "pawns", id);
  await deleteDoc(pawnRef);
}

export async function getPawnByRef(refId: string): Promise<PawnRecord | null> {
  if (!db) return null;
  const q = query(collection(db, "pawns"), where("refId", "==", refId));
  const querySnapshot = await getDocs(q);
  if (querySnapshot.empty) return null;
  const docSnap = querySnapshot.docs[0];
  return { id: docSnap.id, ...docSnap.data() } as PawnRecord;
}
