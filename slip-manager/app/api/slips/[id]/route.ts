import { NextResponse } from 'next/server';
import { getDb } from '@/lib/firebase-admin';

export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const db = getDb();
    const body = await request.json();
    await db.collection('slips').doc(id).update({ ...body, updatedAt: new Date().toISOString() });
    return NextResponse.json({ id, message: 'Updated' });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const db = getDb();
    await db.collection('slips').doc(id).delete();
    return NextResponse.json({ id, message: 'Deleted' });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
