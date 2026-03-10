import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

// QRMember Firebase config - load from file
const keyPath = path.join(process.cwd(), 'qrmember-key.pem');
const privateKey = fs.readFileSync(keyPath, 'utf8');

const qrmemberConfig = {
  projectId: 'qrmember',
  clientEmail: 'google-sheets-writer@qrmember.iam.gserviceaccount.com',
  privateKey: privateKey,
};

interface Transaction {
  purchase_amount?: number;
  timestamp?: {
    _seconds: number;
    _nanoseconds: number;
  };
}

export async function GET() {
  try {
    // Dynamic import firebase-admin
    const { initializeApp, cert, getApps, getApp } = require('firebase-admin/app');
    const { getFirestore } = require('firebase-admin/firestore');

    // Check if app already exists
    let qrmemberApp;
    const apps = getApps();
    if (apps.some((app: any) => app.name === 'qrmember')) {
      qrmemberApp = getApp('qrmember');
    } else {
      qrmemberApp = initializeApp({
        credential: cert({
          projectId: qrmemberConfig.projectId,
          clientEmail: qrmemberConfig.clientEmail,
          privateKey: qrmemberConfig.privateKey,
        }),
      }, 'qrmember');
    }

    const db = getFirestore(qrmemberApp);

    // Get all transactions
    const transactionsSnap = await db.collection('transactions').get();
    const transactions: Transaction[] = transactionsSnap.docs.map((d: any) => d.data());

    // Calculate totals
    const now = new Date();
    const today = now.toISOString().split('T')[0];
    const monthStart = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-01`;

    const totalSales = transactions.reduce((sum: number, t: Transaction) => sum + (t.purchase_amount || 0), 0);
    const totalCount = transactions.length;

    // Today's sales
    const todayTransactions = transactions.filter((t: Transaction) => {
      if (!t.timestamp) return false;
      const txDate = new Date(t.timestamp._seconds * 1000).toISOString().split('T')[0];
      return txDate === today;
    });
    const todaySales = todayTransactions.reduce((sum: number, t: Transaction) => sum + (t.purchase_amount || 0), 0);
    const todayCount = todayTransactions.length;

    // This month's sales
    const monthTransactions = transactions.filter((t: Transaction) => {
      if (!t.timestamp) return false;
      const txDate = new Date(t.timestamp._seconds * 1000).toISOString().split('T')[0];
      return txDate >= monthStart;
    });
    const monthSales = monthTransactions.reduce((sum: number, t: Transaction) => sum + (t.purchase_amount || 0), 0);
    const monthCount = monthTransactions.length;

    return NextResponse.json({
      totalSales,
      totalCount,
      todaySales,
      todayCount,
      monthSales,
      monthCount,
    });
  } catch (error: any) {
    console.error('QRMember API Error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
