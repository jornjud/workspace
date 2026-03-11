import { NextResponse } from 'next/server';
import { db } from '@/lib/firebase';
import { collection, getDocs } from 'firebase/firestore';

interface SlipData {
  id: string;
  date?: string;
  amount?: number;
  bank?: string;
}

interface ExpenseData {
  id: string;
  date?: string;
  amount?: number;
}

export async function GET() {
  try {
    const now = new Date();
    const today = now.toISOString().split('T')[0]; // "2026-03-10"

    // Get all slips
    const allSnap = await getDocs(collection(db, 'slips'));
    const allSlips: SlipData[] = allSnap.docs
    .map(d => ({ id: d.id, ...d.data() } as SlipData))
    // กรองเอาเฉพาะ slip จริงๆ (ไม่เอา expense)
    .filter(s => s.status !== 'expense' && s.bank !== 'เงินสด');

    // Get all expenses
    const expensesSnap = await getDocs(collection(db, 'expenses'));
    const allExpenses: ExpenseData[] = expensesSnap.docs.map(d => ({ id: d.id, ...d.data() } as ExpenseData));

    // Parse Thai date "10 มี.ค. 2569" to "2026-03-10"
    const parseThaiDate = (dateStr: string): string => {
      if (!dateStr) return '';
      if (dateStr.includes('-') && !dateStr.includes('มี')) return dateStr;
      
      const thaiMonths: Record<string, string> = {
        'ม.ค.': '01', 'ก.พ.': '02', 'มี.ค.': '03', 'เม.ย.': '04',
        'พ.ค.': '05', 'มิ.ย.': '06', 'ก.ค.': '07', 'ส.ค.': '08',
        'ก.ย.': '09', 'ต.ค.': '10', 'พ.ย.': '11', 'ธ.ค.': '12'
      };
      
      const match = dateStr.match(/(\d+)\s+(\S+)\s+(\d+)/);
      if (match) {
        const day = match[1].padStart(2, '0');
        const month = thaiMonths[match[2]] || '01';
        const year = (parseInt(match[3]) - 543).toString();
        return `${year}-${month}-${day}`;
      }
      return dateStr;
    };

    // Filter today's slips
    const todaySlips = allSlips.filter(slip => {
      const normalizedDate = parseThaiDate(slip.date || '');
      return normalizedDate === today;
    });

    // Filter this month's slips
    const currentMonth = now.getMonth() + 1;
    const monthStr = String(currentMonth).padStart(2, '0');
    const monthSlips = allSlips.filter(slip => {
      const normalizedDate = parseThaiDate(slip.date || '');
      return normalizedDate.includes(`-${monthStr}-`);
    });

    // Filter expenses - also check Thai date format
    const todayExpenses = allExpenses.filter(exp => {
      const normalizedDate = parseThaiDate(exp.date || '');
      return normalizedDate === today;
    });
    const monthExpenses = allExpenses.filter(exp => {
      const normalizedDate = parseThaiDate(exp.date || '');
      return normalizedDate.includes(`-${monthStr}-`);
    });

    // Combined costs = slips + expenses
    const todayCosts = todaySlips.reduce((s, slip) => s + (slip.amount || 0), 0) + todayExpenses.reduce((s, exp) => s + (exp.amount || 0), 0);
    const monthCosts = monthSlips.reduce((s, slip) => s + (slip.amount || 0), 0) + monthExpenses.reduce((s, exp) => s + (exp.amount || 0), 0);
    const totalCosts = allSlips.reduce((s, slip) => s + (slip.amount || 0), 0) + allExpenses.reduce((s, exp) => s + (exp.amount || 0), 0);

    const byBank: Record<string, number> = {};
    allSlips.forEach(s => { byBank[s.bank || 'Unknown'] = (byBank[s.bank || 'Unknown'] || 0) + (s.amount || 0); });

    return NextResponse.json({
      // Slip data
      totalAmount: allSlips.reduce((s, slip) => s + (slip.amount || 0), 0),
      totalCount: allSlips.length,
      todaySlipAmount: todaySlips.reduce((s, slip) => s + (slip.amount || 0), 0),
      todaySlipCount: todaySlips.length,
      monthSlipAmount: monthSlips.reduce((s, slip) => s + (slip.amount || 0), 0),
      monthSlipCount: monthSlips.length,
      // Expense data
      totalExpenses: allExpenses.reduce((s, exp) => s + (exp.amount || 0), 0),
      todayExpenses: todayExpenses.reduce((s, exp) => s + (exp.amount || 0), 0),
      monthExpenses: monthExpenses.reduce((s, exp) => s + (exp.amount || 0), 0),
      // Combined costs = slips + expenses
      totalCosts: totalCosts,
      todayCosts: todayCosts,
      monthCosts: monthCosts,
      byBank,
    });
  } catch (error: any) {
    console.error(error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
