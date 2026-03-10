'use client';

import { useState, useEffect, useRef } from 'react';
import { DollarSign, TrendingUp, Calendar, Building2, CheckCircle, XCircle, Clock, Trash2, Eye, Menu, X, BarChart3, List, Home, Camera, Activity, PieChart as PieChartIcon, RefreshCw, Download, Wallet, Receipt, Pencil } from 'lucide-react';
import { format, parseISO, subDays } from 'date-fns';
import { th } from 'date-fns/locale';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line, Legend } from 'recharts';

interface Slip {
  id: string;
  amount: number;
  date: string;
  time: string;
  bank: string;
  senderName: string;
  receiverName: string;
  reference: string;
  status: 'pending' | 'approved' | 'rejected';
}

interface Summary {
  totalAmount: number;
  totalCount: number;
  todaySlipAmount: number;
  todaySlipCount: number;
  monthSlipAmount: number;
  monthSlipCount: number;
  todayExpenses: number;
  monthExpenses: number;
  todayCosts: number;
  monthCosts: number;
  totalCosts: number;
  byBank: Record<string, number>;
}

const COLORS = ['#22c55e', '#3b82f6', '#8b5cf6', '#f59e0b', '#ef4444', '#ec4899', '#06b6d4', '#84cc16'];
const BANK_COLORS: Record<string, string> = {
  'ธนาคารออมสิน': '#f59e0b',
  'กสิกรไทย': '#22c55e', 
  'กรุงเทพ': '#3b82f6',
  'พร้อมเพย์': '#8b5cf6',
  'GSB': '#06b6d4',
};

export default function Dashboard() {
  const [slips, setSlips] = useState<Slip[]>([]);
  const [summary, setSummary] = useState<Summary | null>(null);
  const [qrmember, setQrmember] = useState<{totalSales: number, todaySales: number, monthSales: number, monthCount: number, todayCount: number} | null>(null);
  const [expenses, setExpenses] = useState<{id: string, amount: number, category: string, note: string, date: string}[]>([]);
  const [editingExpense, setEditingExpense] = useState<{id: string, amount: number, category: string, note: string, date: string} | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedSlip, setSelectedSlip] = useState<Slip | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [activeMenu, setActiveMenu] = useState('dashboard');
  const [isMobile, setIsMobile] = useState(false);
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  useEffect(() => { fetchData(); }, []);

  // Real-time refresh every 30 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      fetchData();
    }, 30000);
    return () => clearInterval(interval);
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [sumRes, slipsRes, qrmemberRes, expensesRes] = await Promise.all([
        fetch('/api/summary'),
        fetch('/api/slips?limit=100'),
        fetch('/api/qrmember'),
        fetch('/api/expenses')
      ]);
      const sumData = await sumRes.json();
      setSummary(sumData);
      const data = await slipsRes.json();
      setSlips(data.slips || []);
      const qrmemberData = await qrmemberRes.json();
      setQrmember(qrmemberData);
      const expensesData = await expensesRes.json();
      setExpenses(expensesData.expenses || []);
      setLastUpdate(new Date());
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  };

  const updateStatus = async (id: string, status: 'approved' | 'rejected') => {
    await fetch(`/api/slips/${id}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ status }) });
    fetchData();
  };

  const deleteSlip = async (id: string) => {
    if (!confirm('ยืนยันการลบ?')) return;
    await fetch(`/api/slips/${id}`, { method: 'DELETE' });
    fetchData();
  };

  // Export to CSV
  const exportCSV = () => {
    const headers = ['วันที่', 'เวลา', 'จำนวนเงิน', 'ธนาคาร', 'ผู้โอน', 'ผู้รับ', 'เลขอ้างอิง', 'สถานะ'];
    const rows = slips.map(s => [s.date, s.time, s.amount, s.bank, s.senderName, s.receiverName, s.reference, s.status]);
    const csv = [headers, ...rows].map(r => r.join(',')).join('\n');
    const blob = new Blob(['\ufeff' + csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `slips_${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
  };

  const formatCurrency = (a: number) => new Intl.NumberFormat('th-TH', { style: 'currency', currency: 'THB' }).format(a);
  const getStatusBadge = (s: string) => s === 'approved' ? <span className="flex items-center gap-1 font-bold text-green-600"><CheckCircle size={14}/></span> : s === 'rejected' ? <span className="flex items-center gap-1 font-bold text-red-600"><XCircle size={14}/></span> : <span className="flex items-center gap-1 font-bold text-yellow-600"><Clock size={14}/></span>;
  
  const formatDate = (dateStr: string) => {
    if (!dateStr) return '-';
    try {
      if (dateStr.includes('-') && !dateStr.includes('มี.ค')) {
        return format(parseISO(dateStr), 'dd MMM', { locale: th });
      }
      return dateStr;
    } catch {
      return dateStr;
    }
  };

  // Chart data
  const bankData = Object.entries(summary?.byBank || {}).map(([name, value]) => ({ name, value }));
  
  // Status data
  const statusCounts = {
    pending: slips.filter(s => s.status === 'pending').length,
    approved: slips.filter(s => s.status === 'approved').length,
    rejected: slips.filter(s => s.status === 'rejected').length,
  };

  // Daily trend - last 7 days
  const last7Days = Array.from({ length: 7 }, (_, i) => {
    const d = subDays(new Date(), 6 - i);
    return d.toISOString().split('T')[0];
  });

  // Parse Thai date "10 มี.ค. 2569" to "2026-03-10"
  const parseThaiDate = (dateStr: string): string => {
    if (!dateStr) return '';
    if (dateStr.includes('-')) return dateStr; // Already ISO format
    
    // Thai month mapping
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
  
  const dailyTrend = last7Days.map(day => {
    const normalizedDay = parseThaiDate(day);
    const daySlips = slips.filter(s => {
      const normalizedSlipDate = parseThaiDate(s.date || '');
      return normalizedSlipDate === day;
    });
    const amount = daySlips.reduce((sum, s) => sum + (s.amount || 0), 0);
    const count = daySlips.length;
    const displayDate = format(parseISO(day), 'dd/MM');
    return { date: displayDate, amount, count };
  });

  // Recent transactions (latest 5)
  const recentSlips = [...slips].slice(0, 5);

  const menuItems = [
    { id: 'dashboard', label: 'ภาพรวม', icon: Home },
    { id: 'slips', label: 'รายการสลิป', icon: List },
    { id: 'expenses', label: 'ค่าใช้จ่าย', icon: Receipt },
    { id: 'upload', label: 'อัพโหลดสลิป', icon: Camera },
  ];

  // Handle image upload
  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const formData = new FormData();
    formData.append('image', file);
    try {
      setLoading(true);
      const res = await fetch('/api/slips/ocr', { method: 'POST', body: formData });
      const data = await res.json();
      if (data.success) { alert('✅ บันทึกสำเร็จ!'); fetchData(); }
      else { alert('❌ ' + (data.error || 'เกิดข้อผิดพลาด')); }
    } catch (err) { alert('❌ เกิดข้อผิดพลาด'); }
    finally { setLoading(false); if (fileInputRef.current) fileInputRef.current.value = ''; }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      {/* Header */}
      <header className="bg-slate-800/80 backdrop-blur-sm border-b border-slate-700 px-4 py-3 flex items-center justify-between sticky top-0 z-40">
        <div className="flex items-center gap-3">
          <button onClick={() => setSidebarOpen(!sidebarOpen)} className="p-2 hover:bg-slate-700 rounded-lg text-white">
            {sidebarOpen ? <X size={24}/> : <Menu size={24}/>}
          </button>
          <span className="font-bold text-lg text-white">💰 Slip Manager</span>
        </div>
        <div className="flex items-center gap-2 text-slate-400 text-sm">
          <RefreshCw size={14} className={loading ? 'animate-spin' : ''}/>
          <span>{lastUpdate ? format(lastUpdate, 'HH:mm:ss') : '-'}</span>
        </div>
      </header>

      <div className="flex">
        {/* Sidebar */}
        <aside className={`${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} md:translate-x-0 fixed md:static z-40 w-64 bg-slate-800/95 backdrop-blur-sm border-r border-slate-700 text-white flex flex-col min-h-screen transition-transform duration-300`}>
          <div className="p-4 border-b border-slate-700">
            <h1 className="text-xl font-bold">💰 Slip Manager</h1>
            <p className="text-xs text-slate-400 mt-1">Real-time Dashboard</p>
          </div>
          <nav className="flex-1 p-2">
            {menuItems.map(item => (
              <button key={item.id} onClick={() => { setActiveMenu(item.id); setSidebarOpen(false); }} className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg mb-1 transition-colors ${activeMenu === item.id ? 'bg-blue-600 text-white' : 'text-slate-300 hover:bg-slate-700'}`}>
                <item.icon size={20}/><span>{item.label}</span>
              </button>
            ))}
          </nav>
        </aside>

        {/* Mobile Overlay */}
        {sidebarOpen && <div className="md:hidden fixed inset-0 bg-black/50 z-30" onClick={() => setSidebarOpen(false)}/>}

        {/* Main Content */}
        <main className="flex-1 p-4 md:p-6 overflow-x-hidden">
          {/* Dashboard View */}
          {activeMenu === 'dashboard' && (
            <div className="space-y-6">
              {/* Business Overview - Combined */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-gradient-to-br from-green-900/50 to-slate-800/50 rounded-xl p-5 border border-green-700/50 shadow-lg">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-green-400 text-sm font-medium">💰 รายได้ (QRMember)</p>
                      <p className="text-2xl md:text-3xl font-bold text-white mt-1">{qrmember?.monthSales != null ? formatCurrency(qrmember.monthSales) : '-'}</p>
                      <p className="text-slate-500 text-xs mt-1">เดือนนี้</p>
                    </div>
                    <DollarSign className="text-green-400" size={32}/>
                  </div>
                </div>
                <div className="bg-gradient-to-br from-red-900/50 to-slate-800/50 rounded-xl p-5 border border-red-700/50 shadow-lg">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-red-400 text-sm font-medium">📤 ค่าใช้จ่าย (สลิป)</p>
                      <p className="text-2xl md:text-3xl font-bold text-white mt-1">{summary?.monthSlipAmount != null ? formatCurrency(summary.monthSlipAmount) : '-'}</p>
                      <p className="text-slate-500 text-xs mt-1">เดือนนี้</p>
                    </div>
                    <TrendingUp className="text-red-400" size={32}/>
                  </div>
                </div>
                <div className="bg-gradient-to-br from-blue-900/50 to-slate-800/50 rounded-xl p-5 border border-blue-700/50 shadow-lg">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-blue-400 text-sm font-medium">📊 กำไร/ขาดทุน</p>
                      <p className="text-2xl md:text-3xl font-bold text-white mt-1">{(qrmember?.monthSales || 0) - (summary?.monthSlipAmount || 0) - (summary?.monthExpenses || 0) >= 0 ? '' : '-'}{formatCurrency(Math.abs((qrmember?.monthSales || 0) - (summary?.monthSlipAmount || 0) - (summary?.monthExpenses || 0)))}</p>
                      <p className="text-slate-500 text-xs mt-1">เดือนนี้</p>
                    </div>
                    <Calendar className="text-blue-400" size={32}/>
                  </div>
                </div>
                <div className="bg-gradient-to-br from-slate-800 to-slate-800/50 rounded-xl p-5 border border-slate-700 shadow-lg">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-slate-400 text-sm font-medium">🏦 ธนาคาร</p>
                      <p className="text-2xl md:text-3xl font-bold text-white mt-1">{Object.keys(summary?.byBank || {}).length}</p>
                      <p className="text-slate-500 text-xs mt-1">แหล่งที่มา</p>
                    </div>
                    <Building2 className="text-orange-400" size={32}/>
                  </div>
                </div>
              </div>

              {/* Today's Stats */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-gradient-to-br from-slate-800 to-slate-800/50 rounded-xl p-5 border border-slate-700 shadow-lg">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-slate-400 text-sm font-medium">ยอดขายวันนี้</p>
                      <p className="text-xl md:text-2xl font-bold text-green-400 mt-1">{qrmember?.todaySales != null ? formatCurrency(qrmember.todaySales) : '-'}</p>
                      <p className="text-slate-500 text-xs">{qrmember?.todaySales || 0} บาท</p>
                    </div>
                    <DollarSign className="text-green-400" size={24}/>
                  </div>
                </div>
                <div className="bg-gradient-to-br from-slate-800 to-slate-800/50 rounded-xl p-5 border border-slate-700 shadow-lg">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-slate-400 text-sm font-medium">ค่าใช้จ่ายวันนี้</p>
                      <p className="text-xl md:text-2xl font-bold text-red-400 mt-1">{summary?.todayCosts != null ? formatCurrency(summary.todayCosts) : '-'}</p>
                      <p className="text-slate-500 text-xs">{summary?.todaySlipCount || 0} รายการ (สลิป) + {expenses.filter(e => e.date === new Date().toISOString().split('T')[0]).length} รายการ</p>
                    </div>
                    <TrendingUp className="text-red-400" size={24}/>
                  </div>
                </div>
                <div className="bg-gradient-to-br from-slate-800 to-slate-800/50 rounded-xl p-5 border border-slate-700 shadow-lg">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-slate-400 text-sm font-medium">กำไรวันนี้</p>
                      <p className="text-xl md:text-2xl font-bold text-blue-400 mt-1">{formatCurrency((qrmember?.todaySales || 0) - (summary?.todayCosts || 0))}</p>
                    </div>
                    <Calendar className="text-blue-400" size={24}/>
                  </div>
                </div>
                <div className="bg-gradient-to-br from-slate-800 to-slate-800/50 rounded-xl p-5 border border-slate-700 shadow-lg">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-slate-400 text-sm font-medium">ยอดขายเดือนนี้</p>
                      <p className="text-xl md:text-2xl font-bold text-purple-400 mt-1">{qrmember?.monthSales != null ? formatCurrency(qrmember.monthSales) : '-'}</p>
                      <p className="text-slate-500 text-xs">{qrmember?.monthCount || 0} รายการ</p>
                    </div>
                    <Building2 className="text-purple-400" size={24}/>
                  </div>
                </div>
              </div>

              {/* Status Overview */}
              <div className="grid grid-cols-3 gap-4">
                <div className="bg-gradient-to-br from-yellow-900/30 to-slate-800/50 rounded-xl p-4 border border-yellow-700/30">
                  <div className="flex items-center gap-3">
                    <Clock className="text-yellow-400" size={24}/>
                    <div>
                      <p className="text-yellow-400 text-2xl font-bold">{statusCounts.pending}</p>
                      <p className="text-slate-400 text-sm">รออนุมัติ</p>
                    </div>
                  </div>
                </div>
                <div className="bg-gradient-to-br from-green-900/30 to-slate-800/50 rounded-xl p-4 border border-green-700/30">
                  <div className="flex items-center gap-3">
                    <CheckCircle className="text-green-400" size={24}/>
                    <div>
                      <p className="text-green-400 text-2xl font-bold">{statusCounts.approved}</p>
                      <p className="text-slate-400 text-sm">อนุมัติแล้ว</p>
                    </div>
                  </div>
                </div>
                <div className="bg-gradient-to-br from-red-900/30 to-slate-800/50 rounded-xl p-4 border border-red-700/30">
                  <div className="flex items-center gap-3">
                    <XCircle className="text-red-400" size={24}/>
                    <div>
                      <p className="text-red-400 text-2xl font-bold">{statusCounts.rejected}</p>
                      <p className="text-slate-400 text-sm">ปฏิเสธ</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Charts Row */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Daily Trend */}
                <div className="bg-slate-800/50 rounded-xl p-5 border border-slate-700">
                  <h3 className="text-white font-semibold mb-4 flex items-center gap-2"><Activity size={18} className="text-blue-400"/> แนวโน้มรายวัน (7 วัน)</h3>
                  <ResponsiveContainer width="100%" height={250}>
                    <LineChart data={dailyTrend}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#334155"/>
                      <XAxis dataKey="date" stroke="#94a3b8" fontSize={12}/>
                      <YAxis stroke="#94a3b8" fontSize={12}/>
                      <Tooltip contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #334155', borderRadius: '8px' }} formatter={(value) => formatCurrency(Number(value))}/>
                      <Line type="monotone" dataKey="amount" stroke="#3b82f6" strokeWidth={2} dot={{ fill: '#3b82f6' }} name="จำนวนเงิน"/>
                    </LineChart>
                  </ResponsiveContainer>
                </div>

                {/* Bank Distribution */}
                <div className="bg-slate-800/50 rounded-xl p-5 border border-slate-700">
                  <h3 className="text-white font-semibold mb-4 flex items-center gap-2"><PieChartIcon size={18} className="text-purple-400"/> การกระจายตัวตามธนาคาร</h3>
                  <ResponsiveContainer width="100%" height={250}>
                    <PieChart>
                      <Pie data={bankData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80} label={({name, percent}) => `${name} ${((percent || 0) * 100).toFixed(0)}%`}>
                        {bankData.map((entry, index) => <Cell key={entry.name} fill={BANK_COLORS[entry.name] || COLORS[index % COLORS.length]}/>)}
                      </Pie>
                      <Tooltip contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #334155', borderRadius: '8px' }} formatter={(value) => formatCurrency(Number(value))}/>
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Recent Transactions */}
              <div className="bg-slate-800/50 rounded-xl p-5 border border-slate-700">
                <h3 className="text-white font-semibold mb-4 flex items-center gap-2"><List size={18} className="text-green-400"/> รายการล่าสุด</h3>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="text-slate-400 text-sm border-b border-slate-700">
                      <tr>
                        <th className="text-left py-3 px-2">วันที่</th>
                        <th className="text-left py-3 px-2">จำนวน</th>
                        <th className="text-left py-3 px-2">ธนาคาร</th>
                        <th className="text-left py-3 px-2">ผู้โอน</th>
                        <th className="text-left py-3 px-2">สถานะ</th>
                      </tr>
                    </thead>
                    <tbody className="text-white">
                      {recentSlips.map(slip => (
                        <tr key={slip.id} className="border-b border-slate-700/50 hover:bg-slate-700/30">
                          <td className="py-3 px-2 text-sm">{formatDate(slip.date)} {slip.time}</td>
                          <td className="py-3 px-2 text-green-400 font-semibold">{formatCurrency(slip.amount)}</td>
                          <td className="py-3 px-2 text-sm">{slip.bank}</td>
                          <td className="py-3 px-2 text-sm">{slip.senderName}</td>
                          <td className="py-3 px-2">{getStatusBadge(slip.status)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* Slips List View - Grid */}
          {(activeMenu === 'slips' || activeMenu === 'dashboard') && activeMenu !== 'dashboard' && (
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <h2 className="text-xl font-bold text-white">รายการสลิป</h2>
                <button onClick={exportCSV} className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg font-semibold flex items-center gap-2">
                  <Download size={18}/> Export CSV
                </button>
              </div>
              
              {/* Slips Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {loading ? (
                  <div className="col-span-full py-8 text-center text-slate-400">กำลังโหลด...</div>
                ) : slips.length === 0 ? (
                  <div className="col-span-full py-8 text-center text-slate-500">ไม่มีรายการ</div>
                ) : slips.map(slip => (
                  <div key={slip.id} className="bg-slate-700/30 rounded-lg p-4 border border-slate-600/50 hover:bg-slate-700/50 transition-colors">
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <span className={`px-2 py-1 rounded text-xs font-medium ${slip.status === 'approved' ? 'bg-green-600/30 text-green-400' : slip.status === 'rejected' ? 'bg-red-600/30 text-red-400' : 'bg-yellow-600/30 text-yellow-400'}`}>
                          {slip.status === 'approved' ? '✓ อนุมัติ' : slip.status === 'rejected' ? '✕ ปฏิเสธ' : '⏳ รอ'}
                        </span>
                      </div>
                      <p className="text-green-400 font-bold text-lg">{formatCurrency(slip.amount)}</p>
                    </div>
                    <div className="mb-2">
                      <p className="text-white font-medium">{slip.receiverName || '-'}</p>
                      <p className="text-slate-400 text-sm">{slip.bank}</p>
                    </div>
                    <div className="flex justify-between items-center pt-2 border-t border-slate-600/50">
                      <p className="text-slate-400 text-xs">{formatDate(slip.date)} {slip.time}</p>
                      <div className="flex gap-1">
                        {slip.status === 'pending' && (
                          <>
                            <button onClick={() => updateStatus(slip.id, 'approved')} className="p-1.5 bg-green-600/20 text-green-400 hover:bg-green-600/40 rounded" title="อนุมัติ">✓</button>
                            <button onClick={() => updateStatus(slip.id, 'rejected')} className="p-1.5 bg-red-600/20 text-red-400 hover:bg-red-600/40 rounded" title="ปฏิเสธ">✕</button>
                          </>
                        )}
                        <button onClick={() => setSelectedSlip(slip)} className="p-1.5 bg-blue-600/20 text-blue-400 hover:bg-blue-600/40 rounded" title="ดูรายละเอียด"><Eye size={14}/></button>
                        <button onClick={() => deleteSlip(slip.id)} className="p-1.5 bg-red-600/20 text-red-400 hover:bg-red-600/40 rounded" title="ลบ"><Trash2 size={14}/></button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Stats View */}
          {activeMenu === 'stats' && (
            <div className="space-y-6">
              <h2 className="text-xl font-bold text-white">สถิติ</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-slate-800/50 rounded-xl p-5 border border-slate-700">
                  <h3 className="text-white font-semibold mb-4">📊 แนวโน้มรายวัน</h3>
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={dailyTrend}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#334155"/>
                      <XAxis dataKey="date" stroke="#94a3b8"/>
                      <YAxis stroke="#94a3b8"/>
                      <Tooltip contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #334155', borderRadius: '8px' }} formatter={(value) => formatCurrency(Number(value))}/>
                      <Bar dataKey="amount" fill="#3b82f6" radius={[4, 4, 0, 0]} name="จำนวนเงิน"/>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
                <div className="bg-slate-800/50 rounded-xl p-5 border border-slate-700">
                  <h3 className="text-white font-semibold mb-4">🏦 ธนาคาร</h3>
                  <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                      <Pie data={bankData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={100} label>
                        {bankData.map((entry, index) => <Cell key={entry.name} fill={BANK_COLORS[entry.name] || COLORS[index % COLORS.length]}/>)}
                      </Pie>
                      <Tooltip contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #334155', borderRadius: '8px' }} formatter={(value) => formatCurrency(Number(value))}/>
                      <Legend/>
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                <div className="bg-slate-800/50 rounded-xl p-5 border border-slate-700 md:col-span-2">
                  <h3 className="text-white font-semibold mb-4">📈 สถานะ</h3>
                  <ResponsiveContainer width="100%" height={200}>
                    <PieChart>
                      <Pie data={[
                        { name: 'รออนุมัติ', value: statusCounts.pending, color: '#eab308' },
                        { name: 'อนุมัติ', value: statusCounts.approved, color: '#22c55e' },
                        { name: 'ปฏิเสธ', value: statusCounts.rejected, color: '#ef4444' },
                      ]} dataKey="value" nameKey="name" cx="50%" cy="50%" innerRadius={50} outerRadius={80}>
                        {[{ name: 'รออนุมัติ', value: statusCounts.pending, color: '#eab308' },{ name: 'อนุมัติ', value: statusCounts.approved, color: '#22c55e' },{ name: 'ปฏิเสธ', value: statusCounts.rejected, color: '#ef4444' }].map((entry) => <Cell key={entry.name} fill={entry.color}/>)}
                      </Pie>
                      <Tooltip/>
                      <Legend/>
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>
          )}

          {/* Expenses View */}
          {activeMenu === 'expenses' && (
            <div className="space-y-4">
              <h2 className="text-xl font-bold text-white">ค่าใช้จ่าย</h2>
              
              {/* Add Expense Form */}
              <div className="bg-slate-800/50 rounded-xl border border-slate-700 p-5">
                <h3 className="text-white font-semibold mb-4">➕ เพิ่มค่าใช้จ่าย</h3>
                <form onSubmit={async (e) => {
                  e.preventDefault();
                  const form = e.target as HTMLFormElement;
                  const amount = (form.elements.namedItem('amount') as HTMLInputElement).value;
                  const category = (form.elements.namedItem('category') as HTMLSelectElement).value;
                  const note = (form.elements.namedItem('note') as HTMLInputElement).value;
                  const date = (form.elements.namedItem('date') as HTMLInputElement).value;
                  
                  const res = await fetch('/api/expenses', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ amount, category, note, date })
                  });
                  if (res.ok) {
                    alert('✅ บันทึกสำเร็จ!');
                    form.reset();
                    fetchData();
                  }
                }} className="space-y-3">
                  <div className="grid grid-cols-2 gap-3">
                    <input type="number" name="amount" placeholder="จำนวนเงิน" required className="bg-slate-700 border border-slate-600 rounded-lg px-3 py-2 text-white w-full"/>
                    <input type="date" name="date" defaultValue={new Date().toISOString().split('T')[0]} required className="bg-slate-700 border border-slate-600 rounded-lg px-3 py-2 text-white w-full"/>
                  </div>
                  <select name="category" className="bg-slate-700 border border-slate-600 rounded-lg px-3 py-2 text-white w-full">
                    <option value="ค่าของ">ค่าของ</option>
                    <option value="ค่าน้ำ">ค่าน้ำ</option>
                    <option value="ค่าไฟ">ค่าไฟ</option>
                    <option value="ค่าเช่า">ค่าเช่า</option>
                    <option value="ค่าขนส่ง">ค่าขนส่ง</option>
                    <option value="เงินเดือน">เงินเดือน</option>
                    <option value="อื่นๆ">อื่นๆ</option>
                  </select>
                  <input type="text" name="note" placeholder="หมายเหตุ (เช่น ค่าข้าวมันไท)" className="bg-slate-700 border border-slate-600 rounded-lg px-3 py-2 text-white w-full"/>
                  <button type="submit" className="w-full bg-green-600 hover:bg-green-700 text-white py-2 rounded-lg font-semibold">
                    💾 บันทึก
                  </button>
                </form>
              </div>

              {/* Expenses List - Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {expenses.length === 0 ? (
                  <div className="col-span-full py-8 text-center text-slate-500">ยังไม่มีรายการค่าใช้จ่าย</div>
                ) : expenses.map(exp => (
                  <div key={exp.id} className="bg-slate-700/30 rounded-lg p-4 border border-slate-600/50 hover:bg-slate-700/50 transition-colors">
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <span className="bg-blue-600/30 text-blue-400 px-2 py-1 rounded text-xs">{exp.category}</span>
                      </div>
                      <p className="text-red-400 font-bold">{formatCurrency(exp.amount)}</p>
                    </div>
                    <p className="text-white text-sm mb-1">{exp.note || '-'}</p>
                    <div className="flex justify-between items-center mt-2 pt-2 border-t border-slate-600/50">
                      <p className="text-slate-400 text-xs">{exp.date}</p>
                      <div className="flex gap-1">
                        <button onClick={() => setEditingExpense(exp)} className="p-1.5 bg-blue-600/20 text-blue-400 hover:bg-blue-600/40 rounded" title="แก้ไข">
                          <Pencil size={12}/>
                        </button>
                        <button onClick={async () => {
                          if (!confirm('ยืนยันการลบ?')) return;
                          await fetch(`/api/expenses/${exp.id}`, { method: 'DELETE' });
                          fetchData();
                        }} className="p-1.5 bg-red-600/20 text-red-400 hover:bg-red-600/40 rounded" title="ลบ">
                          <Trash2 size={12}/>
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Report View */}
          {activeMenu === 'report' && (
            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <h2 className="text-xl font-bold text-white">📊 รายงานประจำเดือน</h2>
                <button onClick={() => {
                  const reportData = [
                    ['รายงานประจำเดือน'],
                    [''],
                    ['หัวข้อ', 'จำนวน', 'หมายเหตุ'],
                    ['รายได้ (QRMember)', qrmember?.monthSales || 0, 'ยอดขายเดือนนี้'],
                    ['ค่าใช้จ่าย (สลิป)', summary?.monthSlipAmount || 0, 'ค่าใช้จ่ายจากสลิป'],
                    ['ค่าใช้จ่าย (อื่น)', summary?.monthExpenses || 0, 'ค่าใช้จ่ายที่บันทึก'],
                    ['กำไร/ขาดทุน', (qrmember?.monthSales || 0) - (summary?.monthCosts || 0), ''],
                    [''],
                    ['รายละเอียดรายได้'],
                    ['วันที่', 'ผู้รับ', 'จำนวน', 'ธนาคาร'],
                    ...slips.map(s => [s.date, s.receiverName, s.amount, s.bank]),
                  ];
                  const csv = reportData.map(r => r.join(',')).join('\n');
                  const blob = new Blob(['\ufeff' + csv], { type: 'text/csv;charset=utf-8;' });
                  const link = document.createElement('a');
                  link.href = URL.createObjectURL(blob);
                  link.download = `report_${new Date().toISOString().split('T')[0]}.csv`;
                  link.click();
                }} className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg font-semibold flex items-center gap-2">
                  <Download size={18}/> Export CSV
                </button>
              </div>

              {/* Monthly Summary */}
              <div className="bg-gradient-to-br from-slate-800 to-slate-800/50 rounded-xl p-6 border border-slate-700">
                <h3 className="text-white font-semibold mb-4">📅 สรุปเดือนนี้</h3>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  <div className="bg-green-900/30 rounded-lg p-4 border border-green-700/30">
                    <p className="text-green-400 text-sm">💰 รายได้ (QRMember)</p>
                    <p className="text-2xl font-bold text-white mt-1">{qrmember?.monthSales != null ? formatCurrency(qrmember.monthSales) : '-'}</p>
                    <p className="text-slate-400 text-xs">{qrmember?.monthCount || 0} รายการ</p>
                  </div>
                  <div className="bg-red-900/30 rounded-lg p-4 border border-red-700/30">
                    <p className="text-red-400 text-sm">📤 ค่าใช้จ่าย (สลิป)</p>
                    <p className="text-2xl font-bold text-white mt-1">{summary?.monthSlipAmount != null ? formatCurrency(summary.monthSlipAmount) : '-'}</p>
                    <p className="text-slate-400 text-xs">{summary?.monthSlipCount || 0} รายการ</p>
                  </div>
                  <div className="bg-yellow-900/30 rounded-lg p-4 border border-yellow-700/30">
                    <p className="text-yellow-400 text-sm">📝 ค่าใช้จ่าย (อื่น)</p>
                    <p className="text-2xl font-bold text-white mt-1">{formatCurrency(summary?.monthCosts || 0)}</p>
                    <p className="text-slate-400 text-xs">{expenses.length} รายการ</p>
                  </div>
                </div>
                <div className="mt-4 bg-blue-900/30 rounded-lg p-4 border border-blue-700/30">
                  <p className="text-blue-400 text-sm font-semibold">📊 กำไร/ขาดทุน สุทธิ</p>
                  <p className={`text-3xl font-bold mt-1 ${((qrmember?.monthSales || 0) - (summary?.monthCosts || 0)) >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                    {formatCurrency((qrmember?.monthSales || 0) - (summary?.monthCosts || 0))}
                  </p>
                </div>
              </div>

              {/* Daily Breakdown */}
              <div className="bg-slate-800/50 rounded-xl p-6 border border-slate-700">
                <h3 className="text-white font-semibold mb-4">📅 รายวัน (7 วันล่าสุด)</h3>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-slate-700/50 text-slate-300">
                      <tr>
                        <th className="text-left py-2 px-3">วันที่</th>
                        <th className="text-right py-2 px-3">รายได้</th>
                        <th className="text-right py-2 px-3">ค่าใช้จ่าย</th>
                        <th className="text-right py-2 px-3">กำไร/ขาดทุน</th>
                      </tr>
                    </thead>
                    <tbody className="text-white">
                      {dailyTrend.map(day => (
                        <tr key={day.date} className="border-b border-slate-700/50">
                          <td className="py-2 px-3">{day.date}</td>
                          <td className="py-2 px-3 text-right text-green-400">{formatCurrency(day.amount)}</td>
                          <td className="py-2 px-3 text-right text-red-400">-</td>
                          <td className="py-2 px-3 text-right text-green-400">{formatCurrency(day.amount)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* Upload View */}
          {activeMenu === 'upload' && (
            <div className="space-y-4">
              <h2 className="text-xl font-bold text-white">อัพโหลดสลิป</h2>
              <div className="bg-slate-800/50 rounded-xl border border-slate-700 p-8 text-center">
                <Camera size={64} className="mx-auto text-slate-500 mb-4"/>
                <p className="text-slate-400 mb-4">ส่งรูปสลิปมาที่นี่ ระบบจะวิเคราะห์และบันทึกอัตโนมัติ</p>
                <input type="file" accept="image/*" onChange={handleImageUpload} ref={fileInputRef} className="hidden" id="slip-upload"/>
                <label htmlFor="slip-upload" className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold cursor-pointer inline-block">
                  📤 เลือกรูปภาพ
                </label>
                {loading && <p className="mt-4 text-blue-400">กำลังประมวลผล...</p>}
              </div>
            </div>
          )}
        </main>
      </div>

      {/* Modal */}
      {selectedSlip && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4" onClick={() => setSelectedSlip(null)}>
          <div className="bg-slate-800 rounded-2xl shadow-2xl max-w-md w-full p-6 border border-slate-700" onClick={e => e.stopPropagation()}>
            <h2 className="text-xl font-bold mb-4 text-white">รายละเอียด</h2>
            <div className="space-y-3 text-slate-300">
              <div className="flex justify-between border-b border-slate-700 pb-2"><span className="text-slate-500">จำนวน:</span><span className="font-bold text-green-400">{formatCurrency(selectedSlip.amount)}</span></div>
              <div className="flex justify-between border-b border-slate-700 pb-2"><span className="text-slate-500">วันที่:</span><span>{selectedSlip.date} {selectedSlip.time}</span></div>
              <div className="flex justify-between border-b border-slate-700 pb-2"><span className="text-slate-500">ธนาคาร:</span><span>{selectedSlip.bank}</span></div>
              <div className="flex justify-between border-b border-slate-700 pb-2"><span className="text-slate-500">ผู้โอน:</span><span>{selectedSlip.senderName}</span></div>
              <div className="flex justify-between border-b border-slate-700 pb-2"><span className="text-slate-500">ผู้รับ:</span><span>{selectedSlip.receiverName}</span></div>
              <div className="flex justify-between"><span className="text-slate-500">อ้างอิง:</span><span className="font-mono text-xs">{selectedSlip.reference}</span></div>
            </div>
            <div className="mt-6 flex flex-wrap justify-end gap-2">
              {selectedSlip.status === 'pending' && (<>
                <button onClick={() => { updateStatus(selectedSlip.id, 'approved'); setSelectedSlip(null); }} className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg font-semibold text-sm">✓ อนุมัติ</button>
                <button onClick={() => { updateStatus(selectedSlip.id, 'rejected'); setSelectedSlip(null); }} className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg font-semibold text-sm">✕ ปฏิเสธ</button>
              </>)}
              <button onClick={() => setSelectedSlip(null)} className="px-4 py-2 bg-slate-600 hover:bg-slate-700 text-white rounded-lg font-semibold text-sm">ปิด</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
