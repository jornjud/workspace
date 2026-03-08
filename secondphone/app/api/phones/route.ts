import { NextResponse } from "next/server";
import { db } from "@/lib/firebase";
import { collection, getDocs, doc, updateDoc, addDoc, deleteDoc } from "firebase/firestore";

// GET - ดึงข้อมูลสินค้าทั้งหมด
export async function GET() {
  try {
    const phonesCollection = collection(db, "phones");
    const snapshot = await getDocs(phonesCollection);
    const phones = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
    return NextResponse.json(phones);
  } catch (error) {
    console.error("Error fetching phones:", error);
    return NextResponse.json({ error: "Failed to fetch phones" }, { status: 500 });
  }
}

// POST - เพิ่มสินค้าใหม่
export async function POST(request: Request) {
  try {
    const data = await request.json();
    const phonesCollection = collection(db, "phones");
    const docRef = await addDoc(phonesCollection, {
      ...data,
      addedAt: new Date().toISOString().split("T")[0]
    });
    return NextResponse.json({ id: docRef.id, success: true });
  } catch (error) {
    console.error("Error adding phone:", error);
    return NextResponse.json({ error: "Failed to add phone" }, { status: 500 });
  }
}

// PUT - อัปเดทสินค้า
export async function PUT(request: Request) {
  try {
    const { id, ...data } = await request.json();
    const phoneDoc = doc(db, "phones", id);
    await updateDoc(phoneDoc, data);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error updating phone:", error);
    return NextResponse.json({ error: "Failed to update phone" }, { status: 500 });
  }
}

// DELETE - ลบสินค้า
export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");
    if (!id) {
      return NextResponse.json({ error: "ID is required" }, { status: 400 });
    }
    const phoneDoc = doc(db, "phones", id);
    await deleteDoc(phoneDoc);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting phone:", error);
    return NextResponse.json({ error: "Failed to delete phone" }, { status: 500 });
  }
}
