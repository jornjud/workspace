import { NextResponse } from 'next/server';
import { db } from '@/lib/firebase';
import { collection, addDoc, getDocs, query, orderBy, limit, where, getCountFromServer, doc, updateDoc, deleteDoc, getDoc } from 'firebase/firestore';

// POST: บันทึกเป็น "ค่าใช้จ่าย" แทนสลิป (เพราะทุกสลิปเป็นรายจ่าย)
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { reference, amount, receiverName, senderName, date, time, bank } = body;

    // 🔍 ตรวจสอบการเพิ่มซ้ำใน expenses
    if (reference) {
      const refQuery = query(collection(db, 'expenses'), where('reference', '==', reference));
      const refSnapshot = await getDocs(refQuery);
      if (!refSnapshot.empty) {
        return NextResponse.json({ 
          error: '❌ รายการนี้มีอยู่แล้ว!', 
          duplicate: true,
          existingId: refSnapshot.docs[0].id 
        }, { status: 409 });
      }
    }

    // บันทึกเป็น expenses แทน slips
    const expenseData = {
      amount: Number(amount),
      category: 'สลิป/ใบเสร็จ',
      note: receiverName || senderName || 'ค่าใช้จ่าย',
      date: date || new Date().toISOString().split('T')[0],
      time: time || '',
      bank: bank || '',
      reference: reference || '',
      createdAt: new Date().toISOString(),
    };

    const docRef = await addDoc(collection(db, 'expenses'), expenseData);
    return NextResponse.json({ id: docRef.id, message: '✅ บันทึกค่าใช้จ่ายสำเร็จ' }, { status: 201 });
  } catch (error: any) {
    console.error('Error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
