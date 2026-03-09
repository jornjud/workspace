'use client';

import { useState, useEffect, useRef } from 'react';
import { DollarSign, TrendingUp, Calendar, Building2, CheckCircle, XCircle, Clock, Trash2, Eye, Menu, X, BarChart3, List, Settings, Home, Download, Upload, Camera } from 'lucide-react';
import { format, parseISO } from 'date-fns';
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
  todayAmount: number;
  todayCount: number;
  monthAmount: number;
  monthCount: number;
  byBank: Record<string, number>;
}

const COLORS = ['#22c55e', '#3b82f6', '#8b5cf6', '#f59e0b', '#ef4444', '#ec4899'];

export default function Dashboard() {
  const [slips, setSlips] = useState<Slip[]>([]);
  const [summary, setSummary] = useState<Summary | null>(null);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'pending' | 'approved' | 'rejected'>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSlip, setSelectedSlip] = useState<Slip | null>(null);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [activeMenu, setActiveMenu] = useState('dashboard');
  const [isMobile, setIsMobile] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  useEffect(() => { fetchData(); }, [filter]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [sumRes, slipsRes] = await Promise.all([
        fetch('/api/summary'),
        fetch(`/api/slips?status=${filter}&limit=100`)
      ]);
      setSummary(await sumRes.json());
      const data = await slipsRes.json();
      setSlips(data.slips || []);
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  };

  const updateStatus = async (id: string, status: 'approved' | 'rejected') => {
    await fetch(`/api/slips/${id}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ status }) });
    fetchData();
  };

  const updateMultipleStatus = async (status: 'approved' | 'rejected') => {
    if (selectedIds.size === 0) return;
    if (!confirm(`ยืนยัน${status === 'approved' ? 'อนุมัติ' : 'ปฏิเสธ'} ${selectedIds.size} รายการ?`)) return;
    await Promise.all(Array.from(selectedIds).map(id => fetch(`/api/slips/${id}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ status }) })));
    setSelectedIds(new Set());
    fetchData();
  };

  const deleteSlip = async (id: string) => {
    if (!confirm('ยืนยันการลบ?')) return;
    await fetch(`/api/slips/${id}`, { method: 'DELETE' });
    fetchData();
  };

  const deleteMultiple = async () => {
    if (selectedIds.size === 0) return;
    if (!confirm(`ยืนยันการลบ ${selectedIds.size} รายการ?`)) return;
    await Promise.all(Array.from(selectedIds).map(id => fetch(`/api/slips/${id}`, { method: 'DELETE' })));
    setSelectedIds(new Set());
    fetchData();
  };

  const toggleSelect = (id: string) => {
    const newSet = new Set(selectedIds);
    newSet.has(id) ? newSet.delete(id) : newSet.add(id);
    setSelectedIds(newSet);
  };

  const toggleSelectAll = () => {
    selectedIds.size === filteredSlips.length ? setSelectedIds(new Set()) : setSelectedIds(new Set(filteredSlips.map(s => s.id)));
  };

  // Export to CSV
  const exportCSV = () => {
    const headers = ['วันที่', 'เวลา', 'จำนวนเงิน', 'ธนาคาร', 'ผู้โอน', 'ผู้รับ', 'เลขอ้างอิง', 'สถานะ'];
    const rows = filteredSlips.map(s => [s.date, s.time, s.amount, s.bank, s.senderName, s.receiverName, s.reference, s.status]);
    const csv = [headers, ...rows].map(r => r.join(',')).join('\n');
    const blob = new Blob(['\ufeff' + csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `slips_${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
  };

  // Auto OCR - Handle image upload
  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('image', file);

    try {
      setLoading(true);
      const res = await fetch('/api/slips/ocr', {
        method: 'POST',
        body: formData,
      });
      const data = await res.json();
      if (data.success) {
        alert('✅ บันทึกสำเร็จ!');
        fetchData();
      } else {
        alert('❌ ' + (data.error || 'เกิดข้อผิดพลาด'));
      }
    } catch (err) {
      alert('❌ เกิดข้อผิดพลาด');
    } finally {
      setLoading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const filteredSlips = slips.filter(s => s.senderName.toLowerCase().includes(searchTerm.toLowerCase()) || s.receiverName.toLowerCase().includes(searchTerm.toLowerCase()) || s.bank.toLowerCase().includes(searchTerm.toLowerCase()) || s.reference.includes(searchTerm));
  const formatCurrency = (a: number) => new Intl.NumberFormat('th-TH', { style: 'currency', currency: 'THB' }).format(a);
  const getStatusBadge = (s: string) => s === 'approved' ? <span className="flex items-center gap-1 font-bold text-green-700"><CheckCircle size={14}/></span> : s === 'rejected' ? <span className="flex items-center gap-1 font-bold text-red-700"><XCircle size={14}/></span> : <span className="flex items-center gap-1 font-bold text-yellow-700"><Clock size={14}/></span>;
  const bankColors: Record<string, string> = { 'ธนาคารออมสิน': 'bg-yellow-200 text-yellow-900', 'กสิกรไทย': 'bg-orange-200 text-orange-900', 'กรุงเทพ': 'bg-blue-200 text-blue-900' };

  // Chart data
  const bankData = Object.entries(summary?.byBank || {}).map(([name, value]) => ({ name, value }));
  const dailyData = Object.entries(
    filteredSlips.reduce((acc: Record<string, number>, slip) => {
      acc[slip.date] = (acc[slip.date] || 0) + slip.amount;
      return acc;
    }, {})
  ).map(([date, amount]) => ({ date, amount })).sort((a, b) => a.date.localeCompare(b.date));

  const statusData = [
    { name: 'รออนุมัติ', value: slips.filter(s => s.status === 'pending').length, color: '#eab308' },
    { name: 'อนุมัติ', value: slips.filter(s => s.status === 'approved').length, color: '#22c55e' },
    { name: 'ปฏิเสธ', value: slips.filter(s => s.status === 'rejected').length, color: '#ef4444' },
  ];

  const menuItems = [
    { id: 'dashboard', label: 'ภาพรวม', icon: Home },
    { id: 'slips', label: 'รายการสลิป', icon: List },
    { id: 'stats', label: 'สถิติ', icon: BarChart3 },
    { id: 'upload', label: 'อัพโหลดสลิป', icon: Camera },
  ];

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Mobile Header */}
      <header className="md:hidden bg-blue-800 text-white px-4 py-3 flex items-center justify-between sticky top-0 z-40">
        <div className="flex items-center gap-3">
          <button onClick={() => setSidebarOpen(!sidebarOpen)} className="p-2 hover:bg-blue-700 rounded-lg">
            {sidebarOpen ? <X size={24}/> : <Menu size={24}/>}
          </button>
          <span className="font-bold text-lg">💰 Slip Manager</span>
        </div>
      </header>

      <div className="flex">
        {/* Sidebar - Desktop */}
        <aside className="hidden md:flex w-64 bg-blue-800 text-white flex-col min-h-screen sticky top-0">
          <div className="p-4 border-b border-blue-700">
            <h1 className="text-xl font-bold">💰 Slip Manager</h1>
          </div>
          <nav className="flex-1 p-2">
            {menuItems.map(item => (
              <button key={item.id} onClick={() => setActiveMenu(item.id)} className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg mb-1 ${activeMenu === item.id ? 'bg-blue-600' : 'hover:bg-blue-700'}`}>
                <item.icon size={20}/><span>{item.label}</span>
              </button>
            ))}
          </nav>
        </aside>

        {/* Mobile Sidebar Overlay */}
        {sidebarOpen && (
          <div className="md:hidden fixed inset-0 bg-black/50 z-40" onClick={() => setSidebarOpen(false)}>
            <aside className="w-64 bg-blue-800 text-white h-full" onClick={e => e.stopPropagation()}>
              <div className="p-4 border-b border-blue-700 flex justify-between items-center">
                <h1 className="text-xl font-bold">💰 Slip Manager</h1>
                <button onClick={() => setSidebarOpen(false)} className="p-2 hover:bg-blue-700 rounded-lg"><X size={24}/></button>
              </div>
              <nav className="p-2">
                {menuItems.map(item => (
                  <button key={item.id} onClick={() => { setActiveMenu(item.id); setSidebarOpen(false); }} className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg mb-1 ${activeMenu === item.id ? 'bg-blue-600' : 'hover:bg-blue-700'}`}>
                    <item.icon size={20}/><span>{item.label}</span>
                  </button>
                ))}
              </nav>
            </aside>
          </div>
        )}

        {/* Main Content */}
        <main className="flex-1 p-4 md:p-6 overflow-x-hidden">
          <h2 className="text-xl md:text-2xl font-bold text-gray-800 mb-4">{menuItems.find(m => m.id === activeMenu)?.label}</h2>

          {/* Summary Cards */}
          {(activeMenu === 'dashboard' || activeMenu === 'stats') && (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4 mb-4 md:mb-6">
              {[{ label: 'ยอดรวม', value: summary?.totalAmount, count: summary?.totalCount, color: 'green', icon: DollarSign },{ label: 'วันนี้', value: summary?.todayAmount, count: summary?.todayCount, color: 'blue', icon: Calendar },{ label: 'เดือนนี้', value: summary?.monthAmount, count: summary?.monthCount, color: 'purple', icon: TrendingUp },{ label: 'ธนาคาร', value: Object.keys(summary?.byBank || {}).length, count: null, color: 'gray', icon: Building2 }].map((item, i) => (
                <div key={i} className={`bg-white rounded-xl shadow-md md:shadow-lg p-3 md:p-5 border-l-4 border-${item.color}-500`}>
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="text-xs md:text-sm text-gray-500 font-medium">{item.label}</p>
                      <p className="text-lg md:text-2xl font-bold text-gray-900">{item.value != null ? (item.count != null ? formatCurrency(item.value) : item.value) : '-'}</p>
                      {item.count != null && <p className="text-xs text-gray-400">{item.count} รายการ</p>}
                    </div>
                    <item.icon className={`text-${item.color}-600`} size={isMobile ? 24 : 36}/>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Stats - Charts */}
          {activeMenu === 'stats' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
              {/* Daily Chart */}
              <div className="bg-white rounded-xl shadow-lg p-4">
                <h3 className="font-bold text-gray-800 mb-4">📊 รายวัน</h3>
                <ResponsiveContainer width="100%" height={250}>
                  <BarChart data={dailyData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" tick={{fontSize: 12}} />
                    <YAxis tick={{fontSize: 12}} />
                    <Tooltip formatter={(value) => formatCurrency(Number(value))} />
                    <Bar dataKey="amount" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>

              {/* Bank Pie Chart */}
              <div className="bg-white rounded-xl shadow-lg p-4">
                <h3 className="font-bold text-gray-800 mb-4">🏦 ธนาคาร</h3>
                <ResponsiveContainer width="100%" height={250}>
                  <PieChart>
                    <Pie data={bankData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80} label={({name, percent}) => `${name} ${((percent || 0) * 100).toFixed(0)}%`}>
                      {bankData.map((entry, index) => <Cell key={entry.name} fill={COLORS[index % COLORS.length]} />)}
                    </Pie>
                    <Tooltip formatter={(value) => formatCurrency(Number(value))} />
                  </PieChart>
                </ResponsiveContainer>
              </div>

              {/* Status Pie Chart */}
              <div className="bg-white rounded-xl shadow-lg p-4 md:col-span-2">
                <h3 className="font-bold text-gray-800 mb-4">📈 สถานะ</h3>
                <ResponsiveContainer width="100%" height={200}>
                  <PieChart>
                    <Pie data={statusData} dataKey="value" nameKey="name" cx="50%" cy="50%" innerRadius={50} outerRadius={80}>
                      {statusData.map((entry, index) => <Cell key={entry.name} fill={entry.color} />)}
                    </Pie>
                    <Tooltip />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>
          )}

          {/* Upload Menu */}
          {activeMenu === 'upload' && (
            <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
              <h3 className="font-bold text-gray-800 mb-4">📷 อัพโหลดสลิป</h3>
              <div className="border-2 border-dashed border-gray-300 rounded-xl p-8 text-center">
                <Camera size={48} className="mx-auto text-gray-400 mb-4"/>
                <p className="text-gray-600 mb-4">ส่งรูปสลิปมาที่นี่ ระบบจะวิเคราะห์และบันทึกอัตโนมัติ</p>
                <input type="file" accept="image/*" onChange={handleImageUpload} ref={fileInputRef} className="hidden" id="slip-upload"/>
                <label htmlFor="slip-upload" className="px-6 py-3 bg-blue-600 text-white rounded-lg font-semibold cursor-pointer hover:bg-blue-700 inline-block">
                  📤 เลือกรูปภาพ
                </label>
                {loading && <p className="mt-4 text-blue-600">กำลังประมวลผล...</p>}
              </div>
            </div>
          )}

          {/* Filters */}
          {(activeMenu === 'dashboard' || activeMenu === 'slips') && (
            <div className="bg-white rounded-xl shadow-md md:shadow-lg mb-4 md:mb-6 p-3 md:p-4">
              <div className="flex flex-col gap-3">
                <div className="flex gap-2 overflow-x-auto pb-2">
                  {(['all', 'pending', 'approved', 'rejected'] as const).map(f => (
                    <button key={f} onClick={() => setFilter(f)} className={`px-3 md:px-4 py-2 rounded-lg text-sm font-semibold whitespace-nowrap ${filter === f ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}`}>
                      {f === 'all' ? 'ทั้งหมด' : f === 'pending' ? 'รออนุมัติ' : f === 'approved' ? 'อนุมัติ' : 'ปฏิเสธ'}
                    </button>
                  ))}
                  <button onClick={exportCSV} className="px-3 md:px-4 py-2 rounded-lg text-sm font-semibold whitespace-nowrap bg-green-600 text-white hover:bg-green-700 flex items-center gap-1">
                    <Download size={14}/> Export
                  </button>
                </div>
                <input type="text" placeholder="ค้นหา..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} className="border-2 border-gray-300 rounded-lg px-3 md:px-4 py-2 text-gray-900 focus:border-blue-500 focus:outline-none w-full"/>

                {selectedIds.size > 0 && (
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <span className="text-blue-800 font-medium">เลือกแล้ว {selectedIds.size} รายการ</span>
                    <div className="flex gap-2 flex-wrap">
                      <button onClick={() => updateMultipleStatus('approved')} className="px-3 py-2 bg-green-600 text-white rounded-lg font-semibold text-sm flex items-center gap-1"><CheckCircle size={14}/> อนุมัติ</button>
                      <button onClick={() => updateMultipleStatus('rejected')} className="px-3 py-2 bg-red-600 text-white rounded-lg font-semibold text-sm flex items-center gap-1"><XCircle size={14}/> ปฏิเสธ</button>
                      <button onClick={deleteMultiple} className="px-3 py-2 bg-gray-600 text-white rounded-lg font-semibold text-sm flex items-center gap-1"><Trash2 size={14}/> ลบ</button>
                      <button onClick={() => setSelectedIds(new Set())} className="px-3 py-2 bg-gray-200 text-gray-700 rounded-lg font-semibold text-sm">ยกเลิก</button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Table */}
          {(activeMenu === 'dashboard' || activeMenu === 'slips') && (
            <div className="bg-white rounded-xl shadow-md md:shadow-lg overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full min-w-[600px]">
                  <thead className="bg-gray-800 text-white">
                    <tr>
                      <th className="px-3 py-3 text-left text-sm font-bold w-12"><input type="checkbox" checked={selectedIds.size === filteredSlips.length && filteredSlips.length > 0} onChange={toggleSelectAll} className="w-4 h-4 md:w-5 md:h-5"/></th>
                      <th className="px-3 py-3 text-left text-sm font-bold">วันที่</th>
                      <th className="px-3 py-3 text-left text-sm font-bold">จำนวน</th>
                      <th className="px-3 py-3 text-left text-sm font-bold">ธนาคาร</th>
                      <th className="px-3 py-3 text-left text-sm font-bold">ผู้โอน</th>
                      <th className="px-3 py-3 text-left text-sm font-bold">สถานะ</th>
                      <th className="px-3 py-3 text-left text-sm font-bold">จัดการ</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {loading ? <tr><td colSpan={7} className="px-3 py-8 text-center text-gray-600 font-medium">กำลังโหลด...</td></tr> : filteredSlips.length === 0 ? <tr><td colSpan={7} className="px-3 py-8 text-center text-gray-500">ไม่มีรายการ</td></tr> : filteredSlips.map(slip => (
                      <tr key={slip.id} className={`hover:bg-gray-50 ${selectedIds.has(slip.id) ? 'bg-blue-50' : ''}`}>
                        <td className="px-3 py-3"><input type="checkbox" checked={selectedIds.has(slip.id)} onChange={() => toggleSelect(slip.id)} className="w-4 h-4 md:w-5 md:h-5"/></td>
                        <td className="px-3 py-3">
                          <div className="font-semibold text-gray-900 text-sm">{slip.date ? format(parseISO(slip.date), 'dd MMM', { locale: th }) : '-'}</div>
                          <div className="text-gray-500 text-xs">{slip.time}</div>
                        </td>
                        <td className="px-3 py-3"><span className="text-base md:text-lg font-bold text-green-600">{formatCurrency(slip.amount)}</span></td>
                        <td className="px-3 py-3"><span className={`px-2 py-1 rounded-full text-xs font-semibold ${bankColors[slip.bank] || 'bg-gray-200 text-gray-800'}`}>{slip.bank}</span></td>
                        <td className="px-3 py-3 text-gray-900 font-medium text-sm">{slip.senderName}</td>
                        <td className="px-3 py-3">{getStatusBadge(slip.status)}</td>
                        <td className="px-3 py-3">
                          <div className="flex gap-1">
                            {slip.status === 'pending' && (<><button onClick={() => updateStatus(slip.id, 'approved')} className="p-1.5 md:p-2 bg-green-100 text-green-700 hover:bg-green-200 rounded-lg text-xs md:text-sm" title="อนุมัติ">✓</button><button onClick={() => updateStatus(slip.id, 'rejected')} className="p-1.5 md:p-2 bg-red-100 text-red-700 hover:bg-red-200 rounded-lg text-xs md:text-sm" title="ปฏิเสธ">✕</button></>)}
                            <button onClick={() => setSelectedSlip(slip)} className="p-1.5 md:p-2 bg-blue-100 text-blue-700 hover:bg-blue-200 rounded-lg" title="ดูรายละเอียด"><Eye size={16}/></button>
                            <button onClick={() => deleteSlip(slip.id)} className="p-1.5 md:p-2 bg-gray-100 text-gray-500 hover:bg-red-100 hover:text-red-600 rounded-lg" title="ลบ"><Trash2 size={16}/></button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </main>
      </div>

      {/* Modal */}
      {selectedSlip && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4" onClick={() => setSelectedSlip(null)}>
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-4 md:p-6" onClick={e => e.stopPropagation()}>
            <h2 className="text-lg md:text-xl font-bold mb-4 text-gray-900">รายละเอียด</h2>
            <div className="space-y-2 text-sm md:text-base text-gray-800">
              <div className="flex justify-between border-b pb-2"><span className="text-gray-600">จำนวน:</span><span className="font-bold text-green-600">{formatCurrency(selectedSlip.amount)}</span></div>
              <div className="flex justify-between border-b pb-2"><span className="text-gray-600">วันที่:</span><span>{selectedSlip.date} {selectedSlip.time}</span></div>
              <div className="flex justify-between border-b pb-2"><span className="text-gray-600">ธนาคาร:</span><span>{selectedSlip.bank}</span></div>
              <div className="flex justify-between border-b pb-2"><span className="text-gray-600">ผู้โอน:</span><span>{selectedSlip.senderName}</span></div>
              <div className="flex justify-between border-b pb-2"><span className="text-gray-600">ผู้รับ:</span><span>{selectedSlip.receiverName}</span></div>
              <div className="flex justify-between"><span className="text-gray-600">อ้างอิง:</span><span className="font-mono text-xs">{selectedSlip.reference}</span></div>
            </div>
            <div className="mt-4 md:mt-6 flex flex-wrap justify-end gap-2">
              {selectedSlip.status === 'pending' && (<><button onClick={() => { updateStatus(selectedSlip.id, 'approved'); setSelectedSlip(null); }} className="px-4 py-2 bg-green-600 text-white rounded-lg font-semibold text-sm">✓ อนุมัติ</button><button onClick={() => { updateStatus(selectedSlip.id, 'rejected'); setSelectedSlip(null); }} className="px-4 py-2 bg-red-600 text-white rounded-lg font-semibold text-sm">✕ ปฏิเสธ</button></>)}
              <button onClick={() => setSelectedSlip(null)} className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg font-semibold text-sm">ปิด</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
