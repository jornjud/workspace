import { NextResponse } from 'next/server';
import { db } from '@/lib/firebase';
import { collection, addDoc, getDocs, query, orderBy, limit, where, getCountFromServer, doc, updateDoc, deleteDoc, getDoc } from 'firebase/firestore';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const limitNum = parseInt(searchParams.get('limit') || '100');

    let constraints = [];
    if (status && status !== 'all') {
      constraints.push(where('status', '==', status));
    }
    constraints.push(orderBy('createdAt', 'desc'));
    constraints.push(limit(limitNum));

    const q = query(collection(db, 'slips'), ...constraints);
    const snapshot = await getDocs(q);
    const slips = snapshot.docs.map((doc: any) => ({ id: doc.id, ...doc.data() }));

    const countQuery = query(collection(db, 'slips'));
    const totalCount = await getCountFromServer(countQuery);

    return NextResponse.json({ slips, total: totalCount.data().count });
  } catch (error: any) {
    console.error('Error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { reference, amount, receiverName, date } = body;

    // 🔍 ตรวจสอบการเพิ่มซ้ำ
    if (reference) {
      // เช็คจาก reference number
      const refQuery = query(collection(db, 'slips'), where('reference', '==', reference));
      const refSnapshot = await getDocs(refQuery);
      if (!refSnapshot.empty) {
        return NextResponse.json({ 
          error: '❌ รายการนี้มีอยู่แล้ว!', 
          duplicate: true,
          existingId: refSnapshot.docs[0].id 
        }, { status: 409 });
      }
    }

    // เช็คจาก ชื่อผู้รับ + จำนวนเงิน + วันที่ (ถ้าไม่มี reference)
    if (receiverName && amount && date) {
      const dupQuery = query(
        collection(db, 'slips'),
        where('receiverName', '==', receiverName),
        where('amount', '==', Number(amount)),
        where('date', '==', date)
      );
      const dupSnapshot = await getDocs(dupQuery);
      if (!dupSnapshot.empty) {
        return NextResponse.json({ 
          error: '⚠️ รายการอาจซ้ำ!', 
          duplicate: true,
          existingId: dupSnapshot.docs[0].id,
          warning: 'พบรายการที่มีชื่อผู้รับ จำนวนเงิน และวันที่เดียวกัน'
        }, { status: 409 });
      }
    }

    const slipData = { ...body, status: 'pending', createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() };
    const docRef = await addDoc(collection(db, 'slips'), slipData);
    return NextResponse.json({ id: docRef.id, message: '✅ สร้างสำเร็จ' }, { status: 201 });
  } catch (error: any) {
    console.error('Error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
