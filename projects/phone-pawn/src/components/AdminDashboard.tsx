import React, { useState, useEffect } from 'react';
import { getPawns, addPawn, updatePawn, deletePawn, PawnRecord, RenewalEntry } from '../lib/db';
import { generateRefId, calculateInterest, RAM_ROM_OPTIONS, cn } from '../lib/utils';
import { format, addDays, parseISO, startOfDay, differenceInDays } from 'date-fns';
import { Plus, Search, RefreshCw, CheckCircle, Clock, Smartphone, LayoutDashboard, Trash2, Calculator, TrendingUp, AlertCircle, History, Edit, CreditCard, X } from 'lucide-react';

function InterestCalculator() {
  const [calcData, setCalcData] = useState({
    principal: 1000,
    rate: 14, // % per 7 days
    startDate: format(new Date(), 'yyyy-MM-dd'),
    endDate: format(new Date(), 'yyyy-MM-dd'),
  });

  const start = startOfDay(parseISO(calcData.startDate));
  const end = startOfDay(parseISO(calcData.endDate));
  const days = Math.max(differenceInDays(end, start), 1);
  
  const dailyRate = Math.max((calcData.principal * (calcData.rate / 100)) / 7, 20);
  const totalInterest = Math.round(dailyRate * days);

  return (
    <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm mb-8">
      <div className="flex items-center gap-2 mb-4 text-slate-900 font-bold">
        <Calculator size={20} className="text-emerald-600" />
        <h2>ตัวช่วยคำนวณดอกเบี้ย</h2>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div>
          <label className="block text-xs font-bold text-slate-500 uppercase mb-1">เงินต้น (บาท)</label>
          <input 
            type="number" 
            className="w-full px-4 py-2 rounded-xl border border-slate-200 focus:ring-2 focus:ring-emerald-500/20 outline-none"
            value={calcData.principal}
            onChange={e => setCalcData({...calcData, principal: Number(e.target.value)})}
          />
        </div>
        <div>
          <label className="block text-xs font-bold text-slate-500 uppercase mb-1">ดอกเบี้ย (% ต่อ 7 วัน)</label>
          <input 
            type="number" 
            className="w-full px-4 py-2 rounded-xl border border-slate-200 focus:ring-2 focus:ring-emerald-500/20 outline-none"
            value={calcData.rate}
            onChange={e => setCalcData({...calcData, rate: Number(e.target.value)})}
          />
        </div>
        <div>
          <label className="block text-xs font-bold text-slate-500 uppercase mb-1">วันที่เริ่ม</label>
          <input 
            type="date" 
            className="w-full px-4 py-2 rounded-xl border border-slate-200 focus:ring-2 focus:ring-emerald-500/20 outline-none"
            value={calcData.startDate}
            onChange={e => setCalcData({...calcData, startDate: e.target.value})}
          />
        </div>
        <div>
          <label className="block text-xs font-bold text-slate-500 uppercase mb-1">วันที่สิ้นสุด</label>
          <input 
            type="date" 
            className="w-full px-4 py-2 rounded-xl border border-slate-200 focus:ring-2 focus:ring-emerald-500/20 outline-none"
            value={calcData.endDate}
            onChange={e => setCalcData({...calcData, endDate: e.target.value})}
          />
        </div>
      </div>
      
      <div className="mt-6 p-4 bg-emerald-50 rounded-2xl grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div>
          <p className="text-xs font-bold text-emerald-600 uppercase mb-1">จำนวนวัน</p>
          <p className="text-xl font-bold text-emerald-700">{days} วัน</p>
        </div>
        <div>
          <p className="text-xs font-bold text-emerald-600 uppercase mb-1">ดอกเบี้ยรวม</p>
          <p className="text-xl font-bold text-emerald-700">{totalInterest.toLocaleString()} ฿</p>
        </div>
        <div>
          <p className="text-xs font-bold text-emerald-600 uppercase mb-1">ยอดรวมทั้งหมด</p>
          <p className="text-xl font-bold text-emerald-700">{(calcData.principal + totalInterest).toLocaleString()} ฿</p>
        </div>
      </div>
      <p className="mt-2 text-[10px] text-slate-400 text-center">
        * คำนวณเฉลี่ยวันละ {Math.round(dailyRate)} ฿ (ขั้นต่ำ 20 ฿ ต่อวัน)
      </p>
    </div>
  );
}

export default function AdminDashboard() {
  const [pawns, setPawns] = useState<PawnRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'list' | 'summary' | 'calculator'>('list');
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingPawn, setEditingPawn] = useState<PawnRecord | null>(null);
  const [viewingHistory, setViewingHistory] = useState<PawnRecord | null>(null);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'redeemed' | 'expired'>('all');
  const [isAdminAuthenticated, setIsAdminAuthenticated] = useState(false);
  const [adminPassword, setAdminPassword] = useState('');

  // Form state
  const [formData, setFormData] = useState({
    customerName: '',
    phoneModel: '',
    ramRom: RAM_ROM_OPTIONS[0],
    principal: 1000,
    startDate: format(new Date(), 'yyyy-MM-dd'),
    imei: '',
    pin: '',
  });

  useEffect(() => {
    if (isAdminAuthenticated) {
      loadData();
    }
  }, [isAdminAuthenticated]);

  async function loadData() {
    setLoading(true);
    const data = await getPawns();
    setPawns(data);
    setLoading(false);
  }

  const handleAdminLogin = (e: React.FormEvent) => {
    e.preventDefault();
    const correctPassword = 'admin298298';
    if (adminPassword === correctPassword) {
      setIsAdminAuthenticated(true);
    } else {
      alert('รหัสผ่านไม่ถูกต้อง');
    }
  };

  if (!isAdminAuthenticated) {
    return (
      <div className="min-h-[80vh] flex items-center justify-center p-4">
        <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-200 w-full max-w-md">
          <div className="text-center mb-6">
            <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <LayoutDashboard size={32} />
            </div>
            <h1 className="text-2xl font-bold text-slate-900">Admin Login</h1>
            <p className="text-slate-500">กรุณากรอกรหัสผ่านเพื่อเข้าสู่ระบบจัดการ</p>
          </div>
          <form onSubmit={handleAdminLogin} className="space-y-4">
            <input 
              type="password" 
              placeholder="รหัสผ่าน"
              className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none"
              value={adminPassword}
              onChange={(e) => setAdminPassword(e.target.value)}
            />
            <button 
              type="submit"
              className="w-full py-3 bg-emerald-600 text-white rounded-xl font-bold hover:bg-emerald-700 transition-colors"
            >
              เข้าสู่ระบบ
            </button>
          </form>
        </div>
      </div>
    );
  }

  async function handleAddPawn(e: React.FormEvent) {
    e.preventDefault();
    const startDate = parseISO(formData.startDate);
    const dueDate = addDays(startDate, 7);
    
    const newPawn: Omit<PawnRecord, 'id'> = {
      refId: generateRefId(),
      customerName: formData.customerName,
      phoneModel: formData.phoneModel,
      ramRom: formData.ramRom,
      imei: formData.imei,
      pin: formData.pin,
      principal: formData.principal,
      startDate: startDate.toISOString(),
      dueDate: dueDate.toISOString(),
      lastPaymentDate: startDate.toISOString(),
      status: 'active',
      createdAt: new Date().toISOString(),
    };

    await addPawn(newPawn);
    setShowAddModal(false);
    loadData();
    setFormData({
      customerName: '',
      phoneModel: '',
      ramRom: RAM_ROM_OPTIONS[0],
      principal: 1000,
      startDate: format(new Date(), 'yyyy-MM-dd'),
      imei: '',
      pin: '',
    });
  }

  async function handleExtend(pawn: PawnRecord) {
    try {
      const currentDueDate = parseISO(pawn.dueDate);
      const newDueDate = addDays(currentDueDate, 7);
      const interest = calculateInterest(pawn.principal, parseISO(pawn.lastPaymentDate), currentDueDate);
      
      if (confirm(`ต่อดอกเบี้ยจำนวน ${interest} บาท? วันครบกำหนดใหม่จะเป็น ${format(newDueDate, 'dd/MM/yyyy')}`)) {
        const renewalEntry: RenewalEntry = {
          renewalDate: new Date().toISOString(),
          interestPaid: interest,
          previousDueDate: pawn.dueDate,
          newDueDate: newDueDate.toISOString(),
        };

        await updatePawn(pawn.id, {
          dueDate: newDueDate.toISOString(),
          lastPaymentDate: currentDueDate.toISOString(),
          renewalHistory: [...(pawn.renewalHistory || []), renewalEntry],
        });
        loadData();
      }
    } catch (error) {
      console.error("Error extending pawn:", error);
      alert("เกิดข้อผิดพลาดในการต่อดอกเบี้ย");
    }
  }

  async function handleRedeem(pawn: PawnRecord) {
    try {
      const interest = calculateInterest(pawn.principal, parseISO(pawn.lastPaymentDate), new Date());
      const total = pawn.principal + interest;
      
      if (confirm(`ไถ่ถอนเครื่อง? ยอดรวมที่ต้องชำระ: ${total} บาท (ต้น ${pawn.principal} + ดอก ${interest})`)) {
        await updatePawn(pawn.id, { status: 'redeemed' });
        loadData();
      }
    } catch (error) {
      console.error("Error redeeming pawn:", error);
      alert("เกิดข้อผิดพลาดในการไถ่ถอน");
    }
  }

  async function handleDelete(id: string) {
    try {
      if (confirm('คุณแน่ใจหรือไม่ว่าต้องการลบรายการนี้? การกระทำนี้ไม่สามารถย้อนกลับได้')) {
        await deletePawn(id);
        loadData();
      }
    } catch (error) {
      console.error("Error deleting pawn:", error);
      alert("เกิดข้อผิดพลาดในการลบรายการ");
    }
  }

  const filteredPawns = pawns.filter(p => {
    const matchesSearch = p.customerName.toLowerCase().includes(search.toLowerCase()) || 
                         p.refId.toLowerCase().includes(search.toLowerCase()) ||
                         p.phoneModel.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = statusFilter === 'all' || p.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const summary = {
    active: pawns.filter(p => p.status === 'active').length,
    totalPrincipal: pawns.filter(p => p.status === 'active').reduce((sum, p) => sum + p.principal, 0),
    expired: pawns.filter(p => p.status === 'expired').length,
    redeemed: pawns.filter(p => p.status === 'redeemed').length,
  };

  return (
    <div className="min-h-screen bg-slate-50 pb-20">
      {/* Admin Navbar */}
      <nav className="bg-white border-b border-slate-200 sticky top-0 z-40 px-4">
        <div className="max-w-7xl mx-auto flex justify-between items-center h-16">
          <div className="flex items-center gap-2 text-emerald-600 font-bold text-xl">
            <Smartphone className="fill-emerald-600/10" />
            <span className="hidden sm:inline">PhonePawn Admin</span>
            <span className="sm:hidden">Admin</span>
          </div>
          
          <div className="flex items-center gap-1 sm:gap-2">
            <button 
              onClick={() => setActiveTab('list')}
              className={cn(
                "p-2 sm:px-4 sm:py-2 rounded-xl text-sm font-bold transition-all flex items-center gap-2",
                activeTab === 'list' ? "bg-emerald-600 text-white shadow-lg shadow-emerald-200" : "text-slate-600 hover:bg-slate-100"
              )}
            >
              <LayoutDashboard size={18} />
              <span className="hidden md:inline">รายการจำนำ</span>
            </button>
            <button 
              onClick={() => setActiveTab('summary')}
              className={cn(
                "p-2 sm:px-4 sm:py-2 rounded-xl text-sm font-bold transition-all flex items-center gap-2",
                activeTab === 'summary' ? "bg-emerald-600 text-white shadow-lg shadow-emerald-200" : "text-slate-600 hover:bg-slate-100"
              )}
            >
              <TrendingUp size={18} />
              <span className="hidden md:inline">สรุปภาพรวม</span>
            </button>
            <button 
              onClick={() => setActiveTab('calculator')}
              className={cn(
                "p-2 sm:px-4 sm:py-2 rounded-xl text-sm font-bold transition-all flex items-center gap-2",
                activeTab === 'calculator' ? "bg-emerald-600 text-white shadow-lg shadow-emerald-200" : "text-slate-600 hover:bg-slate-100"
              )}
            >
              <Calculator size={18} />
              <span className="hidden md:inline">ตัวช่วยคำนวณ</span>
            </button>
          </div>
        </div>
      </nav>

      <div className="p-4 sm:p-6 max-w-7xl mx-auto">
        {activeTab === 'summary' && (
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="mb-8">
              <h1 className="text-2xl font-bold text-slate-900">สรุปภาพรวม</h1>
              <p className="text-slate-500 text-sm">ข้อมูลสถิติการจำนำทั้งหมดในระบบ</p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-8">
              <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl bg-emerald-100 text-emerald-600 flex items-center justify-center">
                    <TrendingUp size={24} />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-slate-500 uppercase">จำนำอยู่</p>
                    <p className="text-2xl font-bold text-slate-900">{summary.active}</p>
                  </div>
                </div>
              </div>
              <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl bg-blue-100 text-blue-600 flex items-center justify-center">
                    <CreditCard size={24} />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-slate-500 uppercase">เงินต้นรวม</p>
                    <p className="text-2xl font-bold text-slate-900">{summary.totalPrincipal.toLocaleString()} ฿</p>
                  </div>
                </div>
              </div>
              <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl bg-amber-100 text-amber-600 flex items-center justify-center">
                    <AlertCircle size={24} />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-slate-500 uppercase">หลุดจำนำ</p>
                    <p className="text-2xl font-bold text-slate-900">{summary.expired}</p>
                  </div>
                </div>
              </div>
              <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl bg-slate-100 text-slate-600 flex items-center justify-center">
                    <CheckCircle size={24} />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-slate-500 uppercase">ไถ่ถอนแล้ว</p>
                    <p className="text-2xl font-bold text-slate-900">{summary.redeemed}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'calculator' && (
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="mb-8">
              <h1 className="text-2xl font-bold text-slate-900">ตัวช่วยคำนวณ</h1>
              <p className="text-slate-500 text-sm">คำนวณดอกเบี้ยและยอดรวมตามช่วงเวลา</p>
            </div>
            <InterestCalculator />
          </div>
        )}

        {activeTab === 'list' && (
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
              <div>
                <h1 className="text-2xl font-bold text-slate-900">รายการจำนำ</h1>
                <p className="text-slate-500 text-sm">ค้นหาและจัดการข้อมูลลูกค้า</p>
              </div>
              <button 
                onClick={() => setShowAddModal(true)}
                className="w-full sm:w-auto bg-emerald-600 hover:bg-emerald-700 text-white px-6 py-3 rounded-xl flex items-center justify-center gap-2 transition-all shadow-lg shadow-emerald-200 active:scale-95"
              >
                <Plus size={20} />
                เพิ่มรายการใหม่
              </button>
            </div>

            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
              <div className="p-4 border-b border-slate-100 bg-slate-50 flex flex-col lg:flex-row items-center gap-4">
                <div className="relative flex-1 w-full">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                  <input 
                    type="text" 
                    placeholder="ค้นหาชื่อลูกค้า, เลขอ้างอิง, หรือรุ่น..."
                    className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 text-sm"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                  />
                </div>
                <div className="flex gap-2 w-full lg:w-auto overflow-x-auto no-scrollbar pb-1 lg:pb-0">
                  {(['all', 'active', 'redeemed', 'expired'] as const).map((status) => (
                    <button
                      key={status}
                      onClick={() => setStatusFilter(status)}
                      className={cn(
                        "px-4 py-2 rounded-lg text-xs font-bold whitespace-nowrap transition-all",
                        statusFilter === status 
                          ? "bg-emerald-600 text-white shadow-md shadow-emerald-100" 
                          : "bg-white border border-slate-200 text-slate-600 hover:bg-slate-50"
                      )}
                    >
                      {status === 'all' ? 'ทั้งหมด' : status === 'active' ? 'จำนำอยู่' : status === 'redeemed' ? 'ไถ่แล้ว' : 'หลุดจำนำ'}
                    </button>
                  ))}
                </div>
              </div>

              {/* Desktop View: Table */}
              <div className="hidden md:block overflow-x-auto">
                <table className="w-full text-left">
                  <thead className="bg-slate-50 text-slate-500 text-xs uppercase tracking-wider">
                    <tr>
                      <th className="px-6 py-4 font-bold">เลขอ้างอิง</th>
                      <th className="px-6 py-4 font-bold">ลูกค้า</th>
                      <th className="px-6 py-4 font-bold">รุ่นโทรศัพท์</th>
                      <th className="px-6 py-4 font-bold">รหัส PIN</th>
                      <th className="px-6 py-4 font-bold">ยอดจำนำ</th>
                      <th className="px-6 py-4 font-bold">วันครบกำหนด</th>
                      <th className="px-6 py-4 font-bold">สถานะ</th>
                      <th className="px-6 py-4 font-bold text-right">จัดการ</th>
                    </tr>
                  </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center text-slate-400">กำลังโหลดข้อมูล...</td>
                </tr>
              ) : filteredPawns.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center text-slate-400">ไม่พบข้อมูล</td>
                </tr>
              ) : (
                filteredPawns.map((pawn) => (
                  <tr key={pawn.id} className="hover:bg-slate-50/50 transition-colors group">
                    <td className="px-6 py-4 font-mono text-sm text-emerald-600 font-bold">{pawn.refId}</td>
                    <td className="px-6 py-4 font-bold text-slate-900">{pawn.customerName}</td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-slate-900 font-medium">{pawn.phoneModel}</div>
                      <div className="text-xs text-slate-500">{pawn.ramRom}</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm font-mono text-slate-600 bg-slate-100 px-2 py-1 rounded inline-block">
                        {pawn.pin || '-'}
                      </div>
                    </td>
                    <td className="px-6 py-4 font-bold text-slate-900">{pawn.principal.toLocaleString()} ฿</td>
                    <td className="px-6 py-4 text-sm text-slate-600">
                      {format(parseISO(pawn.dueDate), 'dd/MM/yyyy')}
                    </td>
                    <td className="px-6 py-4">
                      {pawn.status === 'active' ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase bg-amber-100 text-amber-800">
                          <Clock size={10} /> กำลังจำนำ
                        </span>
                      ) : pawn.status === 'redeemed' ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase bg-emerald-100 text-emerald-800">
                          <CheckCircle size={10} /> ไถ่ถอนแล้ว
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase bg-rose-100 text-rose-800">
                          <AlertCircle size={10} /> หลุดจำนำ
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex justify-end gap-1">
                        {pawn.status === 'active' && (
                          <>
                            <button 
                              onClick={() => handleExtend(pawn)}
                              className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                              title="ต่อดอกเบี้ย"
                            >
                              <RefreshCw size={18} />
                            </button>
                            <button 
                              onClick={() => handleRedeem(pawn)}
                              className="p-2 text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors"
                              title="ไถ่ถอน"
                            >
                              <CheckCircle size={18} />
                            </button>
                          </>
                        )}
                        <button 
                          onClick={() => setEditingPawn(pawn)}
                          className="p-2 text-slate-600 hover:bg-slate-50 rounded-lg transition-colors"
                          title="แก้ไขข้อมูล"
                        >
                          <Edit size={18} />
                        </button>
                        <button 
                          onClick={() => setViewingHistory(pawn)}
                          className="p-2 text-purple-600 hover:bg-purple-50 rounded-lg transition-colors"
                          title="ดูประวัติ"
                        >
                          <History size={18} />
                        </button>
                        <button 
                          onClick={() => handleDelete(pawn.id)}
                          className="p-2 text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                          title="ลบรายการ"
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

              {/* Mobile View: Cards */}
              <div className="md:hidden divide-y divide-slate-100">
                {loading ? (
                  <div className="p-8 text-center text-slate-400">กำลังโหลดข้อมูล...</div>
                ) : filteredPawns.length === 0 ? (
                  <div className="p-8 text-center text-slate-400">ไม่พบข้อมูล</div>
                ) : (
                  filteredPawns.map((pawn) => (
                    <div key={pawn.id} className="p-4 space-y-4">
                      <div className="flex justify-between items-start">
                        <div>
                          <p className="text-[10px] font-bold text-emerald-600 uppercase tracking-wider mb-1">{pawn.refId}</p>
                          <h3 className="font-bold text-slate-900">{pawn.customerName}</h3>
                          <p className="text-sm text-slate-500">{pawn.phoneModel} ({pawn.ramRom})</p>
                          {pawn.pin && (
                            <p className="text-xs text-slate-400 mt-1">PIN: <span className="font-mono font-bold text-slate-600">{pawn.pin}</span></p>
                          )}
                        </div>
                        {pawn.status === 'active' ? (
                          <span className="px-2 py-1 rounded-lg text-[10px] font-bold uppercase bg-amber-100 text-amber-800">จำนำอยู่</span>
                        ) : pawn.status === 'redeemed' ? (
                          <span className="px-2 py-1 rounded-lg text-[10px] font-bold uppercase bg-emerald-100 text-emerald-800">ไถ่แล้ว</span>
                        ) : (
                          <span className="px-2 py-1 rounded-lg text-[10px] font-bold uppercase bg-rose-100 text-rose-800">หลุด</span>
                        )}
                      </div>
                      
                      <div className="grid grid-cols-2 gap-4 py-3 border-y border-slate-50">
                        <div>
                          <p className="text-[10px] font-bold text-slate-400 uppercase mb-1">ยอดเงินต้น</p>
                          <p className="font-bold text-slate-900">{pawn.principal.toLocaleString()} ฿</p>
                        </div>
                        <div>
                          <p className="text-[10px] font-bold text-slate-400 uppercase mb-1">วันครบกำหนด</p>
                          <p className="font-bold text-slate-900">{format(parseISO(pawn.dueDate), 'dd/MM/yyyy')}</p>
                        </div>
                      </div>

                      <div className="flex gap-2">
                        {pawn.status === 'active' && (
                          <>
                            <button 
                              onClick={() => handleExtend(pawn)}
                              className="flex-1 py-2 bg-blue-50 text-blue-600 rounded-xl text-xs font-bold flex items-center justify-center gap-2"
                            >
                              <RefreshCw size={14} /> ต่อดอก
                            </button>
                            <button 
                              onClick={() => handleRedeem(pawn)}
                              className="flex-1 py-2 bg-emerald-50 text-emerald-600 rounded-xl text-xs font-bold flex items-center justify-center gap-2"
                            >
                              <CheckCircle size={14} /> ไถ่ถอน
                            </button>
                          </>
                        )}
                        <button 
                          onClick={() => setEditingPawn(pawn)}
                          className="p-2 bg-slate-50 text-slate-600 rounded-xl"
                        >
                          <Edit size={16} />
                        </button>
                        <button 
                          onClick={() => setViewingHistory(pawn)}
                          className="p-2 bg-purple-50 text-purple-600 rounded-xl"
                        >
                          <History size={16} />
                        </button>
                        <button 
                          onClick={() => handleDelete(pawn.id)}
                          className="p-2 bg-rose-50 text-rose-600 rounded-xl"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Edit Modal */}
      {editingPawn && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden">
            <div className="p-6 border-b border-slate-100 flex justify-between items-center">
              <h2 className="text-xl font-bold text-slate-900">แก้ไขรายการ</h2>
              <button onClick={() => setEditingPawn(null)} className="text-slate-400 hover:text-slate-600">
                <X size={20} />
              </button>
            </div>
            <form 
              onSubmit={async (e) => {
                e.preventDefault();
                await updatePawn(editingPawn.id, editingPawn);
                setEditingPawn(null);
                loadData();
              }} 
              className="p-6 space-y-4 max-h-[70vh] overflow-y-auto"
            >
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">ชื่อลูกค้า</label>
                <input 
                  required
                  type="text" 
                  className="w-full px-4 py-2 rounded-xl border border-slate-200 focus:ring-2 focus:ring-emerald-500/20 outline-none"
                  value={editingPawn.customerName}
                  onChange={e => setEditingPawn({...editingPawn, customerName: e.target.value})}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">รุ่นโทรศัพท์</label>
                  <input 
                    required
                    type="text" 
                    className="w-full px-4 py-2 rounded-xl border border-slate-200 focus:ring-2 focus:ring-emerald-500/20 outline-none"
                    value={editingPawn.phoneModel}
                    onChange={e => setEditingPawn({...editingPawn, phoneModel: e.target.value})}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">RAM/ROM</label>
                  <select 
                    className="w-full px-4 py-2 rounded-xl border border-slate-200 focus:ring-2 focus:ring-emerald-500/20 outline-none"
                    value={editingPawn.ramRom}
                    onChange={e => setEditingPawn({...editingPawn, ramRom: e.target.value})}
                  >
                    {RAM_ROM_OPTIONS.map(o => <option key={o} value={o}>{o}</option>)}
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">IMEI</label>
                  <input 
                    type="text" 
                    className="w-full px-4 py-2 rounded-xl border border-slate-200 focus:ring-2 focus:ring-emerald-500/20 outline-none"
                    value={editingPawn.imei || ''}
                    onChange={e => setEditingPawn({...editingPawn, imei: e.target.value})}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">รหัส PIN</label>
                  <input 
                    type="text" 
                    className="w-full px-4 py-2 rounded-xl border border-slate-200 focus:ring-2 focus:ring-emerald-500/20 outline-none"
                    value={editingPawn.pin || ''}
                    onChange={e => setEditingPawn({...editingPawn, pin: e.target.value})}
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">เงินต้น</label>
                  <input 
                    required
                    type="number" 
                    className="w-full px-4 py-2 rounded-xl border border-slate-200 focus:ring-2 focus:ring-emerald-500/20 outline-none"
                    value={editingPawn.principal}
                    onChange={e => setEditingPawn({...editingPawn, principal: Number(e.target.value)})}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">สถานะ</label>
                  <select 
                    className="w-full px-4 py-2 rounded-xl border border-slate-200 focus:ring-2 focus:ring-emerald-500/20 outline-none"
                    value={editingPawn.status}
                    onChange={e => setEditingPawn({...editingPawn, status: e.target.value as any})}
                  >
                    <option value="active">จำนำอยู่</option>
                    <option value="redeemed">ไถ่แล้ว</option>
                    <option value="expired">หลุดจำนำ</option>
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">วันที่เริ่ม</label>
                  <input 
                    required
                    type="date" 
                    className="w-full px-4 py-2 rounded-xl border border-slate-200 focus:ring-2 focus:ring-emerald-500/20 outline-none"
                    value={format(parseISO(editingPawn.startDate), 'yyyy-MM-dd')}
                    onChange={e => setEditingPawn({...editingPawn, startDate: new Date(e.target.value).toISOString()})}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">วันครบกำหนด</label>
                  <input 
                    required
                    type="date" 
                    className="w-full px-4 py-2 rounded-xl border border-slate-200 focus:ring-2 focus:ring-emerald-500/20 outline-none"
                    value={format(parseISO(editingPawn.dueDate), 'yyyy-MM-dd')}
                    onChange={e => setEditingPawn({...editingPawn, dueDate: new Date(e.target.value).toISOString()})}
                  />
                </div>
              </div>
              <div className="flex gap-3 pt-4">
                <button 
                  type="button"
                  onClick={() => setEditingPawn(null)}
                  className="flex-1 px-4 py-2 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 transition-colors"
                >
                  ยกเลิก
                </button>
                <button 
                  type="submit"
                  className="flex-1 px-4 py-2 rounded-xl bg-emerald-600 text-white hover:bg-emerald-700 transition-colors"
                >
                  บันทึกการแก้ไข
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* History Modal */}
      {viewingHistory && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden">
            <div className="p-6 border-b border-slate-100 flex justify-between items-center">
              <h2 className="text-xl font-bold text-slate-900">ประวัติการต่อดอก</h2>
              <button onClick={() => setViewingHistory(null)} className="text-slate-400 hover:text-slate-600">
                <X size={20} />
              </button>
            </div>
            <div className="p-6 max-h-[60vh] overflow-y-auto">
              {(!viewingHistory.renewalHistory || viewingHistory.renewalHistory.length === 0) ? (
                <p className="text-center text-slate-400 py-8">ยังไม่มีประวัติการต่อดอก</p>
              ) : (
                <div className="space-y-4">
                  {viewingHistory.renewalHistory.map((entry, idx) => (
                    <div key={idx} className="p-4 rounded-xl bg-slate-50 border border-slate-100">
                      <div className="flex justify-between items-start mb-2">
                        <p className="text-sm font-bold text-slate-900">
                          {format(parseISO(entry.renewalDate), 'dd/MM/yyyy')}
                        </p>
                        <p className="text-sm font-bold text-emerald-600">
                          +{entry.interestPaid.toLocaleString()} ฿
                        </p>
                      </div>
                      <div className="flex justify-between text-xs text-slate-500">
                        <span>ครบกำหนดเดิม: {format(parseISO(entry.previousDueDate), 'dd/MM/yyyy')}</span>
                        <span>ครบกำหนดใหม่: {format(parseISO(entry.newDueDate), 'dd/MM/yyyy')}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
      {/* Add Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden">
            <div className="p-6 border-b border-slate-100 flex justify-between items-center">
              <h2 className="text-xl font-bold text-slate-900">เพิ่มรายการจำนำ</h2>
              <button onClick={() => setShowAddModal(false)} className="text-slate-400 hover:text-slate-600">
                <X size={20} />
              </button>
            </div>
            <form onSubmit={handleAddPawn} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">ชื่อลูกค้า</label>
                <input 
                  required
                  type="text" 
                  className="w-full px-4 py-2 rounded-xl border border-slate-200 focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none"
                  value={formData.customerName}
                  onChange={e => setFormData({...formData, customerName: e.target.value})}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">รุ่นโทรศัพท์</label>
                  <input 
                    required
                    type="text" 
                    placeholder="เช่น OPPO A18"
                    className="w-full px-4 py-2 rounded-xl border border-slate-200 focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none"
                    value={formData.phoneModel}
                    onChange={e => setFormData({...formData, phoneModel: e.target.value})}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">RAM/ROM</label>
                  <select 
                    className="w-full px-4 py-2 rounded-xl border border-slate-200 focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none"
                    value={formData.ramRom}
                    onChange={e => setFormData({...formData, ramRom: e.target.value})}
                  >
                    {RAM_ROM_OPTIONS.map(o => <option key={o} value={o}>{o}</option>)}
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">ยอดเงินจำนำ (บาท)</label>
                <input 
                  required
                  type="number" 
                  className="w-full px-4 py-2 rounded-xl border border-slate-200 focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none"
                  value={formData.principal}
                  onChange={e => setFormData({...formData, principal: parseInt(e.target.value)})}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">วันที่เริ่มจำนำ</label>
                <input 
                  required
                  type="date" 
                  className="w-full px-4 py-2 rounded-xl border border-slate-200 focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none"
                  value={formData.startDate}
                  onChange={e => setFormData({...formData, startDate: e.target.value})}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">IMEI (ถ้ามี)</label>
                  <input 
                    type="text" 
                    placeholder="เลข IMEI"
                    className="w-full px-4 py-2 rounded-xl border border-slate-200 focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none"
                    value={formData.imei}
                    onChange={e => setFormData({...formData, imei: e.target.value})}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">รหัส PIN (ถ้ามี)</label>
                  <input 
                    type="text" 
                    placeholder="รหัสหน้าจอ"
                    className="w-full px-4 py-2 rounded-xl border border-slate-200 focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none"
                    value={formData.pin}
                    onChange={e => setFormData({...formData, pin: e.target.value})}
                  />
                </div>
              </div>
              <div className="flex gap-3 pt-4">
                <button 
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="flex-1 px-4 py-2 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 transition-colors"
                >
                  ยกเลิก
                </button>
                <button 
                  type="submit"
                  className="flex-1 px-4 py-2 rounded-xl bg-emerald-600 text-white hover:bg-emerald-700 transition-colors"
                >
                  บันทึก
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
