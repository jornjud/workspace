import { NextResponse } from 'next/server';
import { db } from '@/lib/firebase';
import { collection, addDoc } from 'firebase/firestore';

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const image = formData.get('image') as File;
    
    if (!image) {
      return NextResponse.json({ success: false, error: 'No image provided' }, { status: 400 });
    }

    const slipData = {
      amount: 0,
      date: new Date().toISOString().split('T')[0],
      time: new Date().toTimeString().split(' ')[0].substring(0, 5),
      bank: 'ธนาคารออมสิน',
      senderName: 'นาย ขจร ตรียุทธ',
      receiverName: 'รอวิเคราะห์',
      reference: `AUTO-${Date.now()}`,
      status: 'pending',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    const docRef = await addDoc(collection(db, 'slips'), slipData);
    
    return NextResponse.json({ 
      success: true, 
      id: docRef.id,
      message: 'Slip uploaded. Please verify and update details.' 
    });
  } catch (error: any) {
    console.error('OCR Error:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
