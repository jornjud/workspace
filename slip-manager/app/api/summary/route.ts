import { NextResponse } from 'next/server';
import { db } from '@/lib/firebase';
import { collection, getDocs } from 'firebase/firestore';

interface SlipData {
  id: string;
  date?: string;
  amount?: number;
  bank?: string;
}

export async function GET() {
  try {
    const now = new Date();
    const today = now.toISOString().split('T')[0]; // "2026-03-10"

    // Get all slips
    const allSnap = await getDocs(collection(db, 'slips'));
    const allSlips: SlipData[] = allSnap.docs.map(d => ({ id: d.id, ...d.data() } as SlipData));

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

    const byBank: Record<string, number> = {};
    allSlips.forEach(s => { byBank[s.bank || 'Unknown'] = (byBank[s.bank || 'Unknown'] || 0) + (s.amount || 0); });

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
