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

    // บันทึกเป็น "ค่าใช้จ่าย" แทนสลิป
    const expenseData = {
      amount: 0, // ต้องแก้ไขหลัง OCR
      category: 'สลิป/ใบเสร็จ',
      note: 'รอวิเคราะห์',
      date: new Date().toISOString().split('T')[0],
      senderName: 'นาย ขจร ตรียุทธ',
      reference: `AUTO-${Date.now()}`,
      createdAt: new Date().toISOString(),
    };

    const docRef = await addDoc(collection(db, 'expenses'), expenseData);
    
    return NextResponse.json({ 
      success: true, 
      id: docRef.id,
      message: 'บันทึกเป็นค่าใช้จ่ายแล้ว! กรุณาแก้ไขจำนวนเงิน' 
    });
  } catch (error: any) {
    console.error('OCR Error:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
