import { NextResponse } from 'next/server';
import { getDb } from '@/lib/firebase-admin';

export async function GET() {
  try {
    const db = getDb();
    const snapshot = await db.collection('slips').orderBy('createdAt', 'desc').limit(100).get();
    const slips = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    return NextResponse.json({ slips, total: slips.length });
  } catch (error: any) {
    console.error('Error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const db = getDb();
    const body = await request.json();
    const slipData = { ...body, status: 'pending', createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() };
    const docRef = await db.collection('slips').add(slipData);
    return NextResponse.json({ id: docRef.id, message: 'Created' }, { status: 201 });
  } catch (error: any) {
    console.error('Error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
