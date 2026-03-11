import { NextResponse } from 'next/server';
import { db } from '@/lib/firebase';
import { collection, addDoc, getDocs, query, where } from 'firebase/firestore';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { amount, category, note, date } = body;

    // 🔍 ตรวจสอบการเพิ่มซ้ำ (ชื่อ + จำนวนเงิน + วันที่)
    if (note && amount && date) {
      const dupQuery = query(
        collection(db, 'expenses'),
        where('note', '==', note),
        where('amount', '==', Number(amount)),
        where('date', '==', date)
      );
      const dupSnapshot = await getDocs(dupQuery);
      if (!dupSnapshot.empty) {
        return NextResponse.json({ 
          error: '⚠️ รายการนี้มีอยู่แล้ว!', 
          duplicate: true,
          existingId: dupSnapshot.docs[0].id 
        }, { status: 409 });
      }
    }

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

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET() {
  try {
    const { getDocs, collection, query, orderBy, limit } = await import('firebase/firestore');
    const q = query(collection(db, 'expenses'), orderBy('createdAt', 'desc'), limit(200));
    const snapshot = await getDocs(q);
    const expenses = snapshot.docs.map(d => ({ id: d.id, ...d.data() }));
    return NextResponse.json({ expenses });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
