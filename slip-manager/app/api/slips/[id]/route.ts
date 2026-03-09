import { NextResponse } from 'next/server';
import { db } from '@/lib/firebase';
import { doc, updateDoc, deleteDoc, getDoc } from 'firebase/firestore';

export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const body = await request.json();
    const slipRef = doc(db, 'slips', id);
    if (!(await getDoc(slipRef)).exists()) return NextResponse.json({ error: 'Not found' }, { status: 404 });
    await updateDoc(slipRef, { ...body, updatedAt: new Date().toISOString() });
    return NextResponse.json({ id, message: 'Updated' });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const slipRef = doc(db, 'slips', id);
    if (!(await getDoc(slipRef)).exists()) return NextResponse.json({ error: 'Not found' }, { status: 404 });
    await deleteDoc(slipRef);
    return NextResponse.json({ id, message: 'Deleted' });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
