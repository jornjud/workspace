import { NextResponse } from 'next/server';
import { getDb } from '@/lib/firebase-admin';

export async function GET() {
  try {
    const db = getDb();
    const now = new Date();
    const today = now.toISOString().split('T')[0];
    const monthStart = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-01`;

    const allSnap = await db.collection('slips').get();
    const todaySnap = await db.collection('slips').where('date', '==', today).get();
    const monthSnap = await db.collection('slips').where('date', '>=', monthStart).get();

    const allSlips = allSnap.docs.map(d => d.data());
    const todaySlips = todaySnap.docs.map(d => d.data());
    const monthSlips = monthSnap.docs.map(d => d.data());

    const byBank: Record<string, number> = {};
    allSlips.forEach(s => { byBank[s.bank] = (byBank[s.bank] || 0) + (s.amount || 0); });

    return NextResponse.json({
      totalAmount: allSlips.reduce((s, slip) => s + (slip.amount || 0), 0),
      totalCount: allSlips.length,
      todayAmount: todaySlips.reduce((s, slip) => s + (slip.amount || 0), 0),
      todayCount: todaySlips.length,
      monthAmount: monthSlips.reduce((s, slip) => s + (slip.amount || 0), 0),
      monthCount: monthSlips.length,
      byBank,
    });
  } catch (error: any) {
    console.error(error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
