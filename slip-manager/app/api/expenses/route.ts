import { NextResponse } from 'next/server';
import { db } from '@/lib/firebase';
import { collection, addDoc } from 'firebase/firestore';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { amount, category, note, date } = body;

    const expense = {
      amount: Number(amount),
      category: category || 'อื่นๆ',
      note: note || '',
      date: date || new Date().toISOString().split('T')[0],
      createdAt: new Date().toISOString(),
    };

    const docRef = await addDoc(collection(db, 'expenses'), expense);
    return NextResponse.json({ success: true, id: docRef.id });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function GET() {
  try {
    const { getDocs, collection, query, orderBy, limit } = await import('firebase/firestore');
    const q = query(collection(db, 'expenses'), orderBy('date', 'desc'), limit(100));
    const snapshot = await getDocs(q);
    const expenses = snapshot.docs.map(d => ({ id: d.id, ...d.data() }));
    return NextResponse.json({ expenses });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
