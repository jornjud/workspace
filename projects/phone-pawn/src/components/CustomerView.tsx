import React, { useState } from 'react';
import { getPawnByRef, PawnRecord } from '../lib/db';
import { calculateInterest } from '../lib/utils';
import { format, parseISO } from 'date-fns';
import { Search, Smartphone, Calendar, CreditCard, ChevronRight, Clock, CheckCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export default function CustomerView() {
  const [refId, setRefId] = useState('');
  const [pawn, setPawn] = useState<PawnRecord | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  async function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    if (!refId.trim()) return;

    setLoading(true);
    setError('');
    try {
      const result = await getPawnByRef(refId.trim().toUpperCase());
      if (result) {
        setPawn(result);
      } else {
        setError('ไม่พบข้อมูลเลขอ้างอิงนี้ กรุณาตรวจสอบอีกครั้ง');
        setPawn(null);
      }
    } catch (err) {
      setError('เกิดข้อผิดพลาดในการค้นหา');
    } finally {
      setLoading(false);
    }
  }

  const interest = pawn ? calculateInterest(pawn.principal, parseISO(pawn.lastPaymentDate), new Date()) : 0;

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center p-4 pt-12">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-emerald-600 text-white mb-4 shadow-lg shadow-emerald-200">
            <Smartphone size={32} />
          </div>
          <h1 className="text-2xl font-bold text-slate-900">ตรวจสอบสถานะ</h1>
          <p className="text-slate-500">กรอกเลขอ้างอิงเพื่อดูรายละเอียดการจำนำ</p>
        </div>

        <form onSubmit={handleSearch} className="mb-8">
          <div className="relative">
            <input 
              type="text" 
              placeholder="เช่น REF-XXXXXX"
              className="w-full pl-4 pr-12 py-4 rounded-2xl border-2 border-white bg-white shadow-sm focus:outline-none focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 transition-all text-lg font-mono uppercase"
              value={refId}
              onChange={(e) => setRefId(e.target.value)}
            />
            <button 
              type="submit"
              disabled={loading}
              className="absolute right-2 top-2 bottom-2 px-4 rounded-xl bg-emerald-600 text-white hover:bg-emerald-700 disabled:opacity-50 transition-colors"
            >
              {loading ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <Search size={20} />}
            </button>
          </div>
          {error && <p className="mt-2 text-red-500 text-sm text-center">{error}</p>}
        </form>

        <AnimatePresence mode="wait">
          {pawn && (
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="space-y-4"
            >
              <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100">
                <div className="flex justify-between items-start mb-6">
                  <div>
                    <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">เลขอ้างอิง</span>
                    <h2 className="text-xl font-mono font-bold text-emerald-600">{pawn.refId}</h2>
                  </div>
                  <div className="text-right">
                    <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">สถานะ</span>
                    <div>
                      {pawn.status === 'active' ? (
                        <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold bg-amber-100 text-amber-800">
                          <Clock size={12} /> กำลังจำนำ
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800">
                          <CheckCircle size={12} /> ไถ่ถอนแล้ว
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="flex items-center gap-4 p-4 rounded-2xl bg-slate-50">
                    <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center text-slate-400 shadow-sm">
                      <Smartphone size={20} />
                    </div>
                    <div>
                      <p className="text-xs text-slate-500 font-medium">รุ่นโทรศัพท์</p>
                      <p className="font-bold text-slate-900">{pawn.phoneModel}</p>
                      <p className="text-xs text-slate-500">{pawn.ramRom}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-4 p-4 rounded-2xl bg-slate-50">
                    <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center text-slate-400 shadow-sm">
                      <Calendar size={20} />
                    </div>
                    <div>
                      <p className="text-xs text-slate-500 font-medium">วันครบกำหนด</p>
                      <p className="font-bold text-slate-900">{format(parseISO(pawn.dueDate), 'dd MMMM yyyy')}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-4 p-4 rounded-2xl bg-slate-50">
                    <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center text-slate-400 shadow-sm">
                      <CreditCard size={20} />
                    </div>
                    <div>
                      <p className="text-xs text-slate-500 font-medium">ยอดเงินต้น</p>
                      <p className="font-bold text-slate-900">{pawn.principal.toLocaleString()} บาท</p>
                    </div>
                  </div>

                  {pawn.imei && (
                    <div className="flex items-center gap-4 p-4 rounded-2xl bg-slate-50">
                      <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center text-slate-400 shadow-sm">
                        <Smartphone size={20} />
                      </div>
                      <div>
                        <p className="text-xs text-slate-500 font-medium">IMEI</p>
                        <p className="font-bold text-slate-900">{pawn.imei}</p>
                      </div>
                    </div>
                  )}

                  {pawn.pin && (
                    <div className="flex items-center gap-4 p-4 rounded-2xl bg-slate-50">
                      <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center text-slate-400 shadow-sm">
                        <Smartphone size={20} />
                      </div>
                      <div>
                        <p className="text-xs text-slate-500 font-medium">รหัส PIN</p>
                        <p className="font-bold text-slate-900">{pawn.pin}</p>
                      </div>
                    </div>
                  )}
                </div>

                {pawn.status === 'active' && (
                  <div className="mt-8 pt-6 border-t border-slate-100">
                    <div className="flex justify-between items-end">
                      <div>
                        <p className="text-xs text-slate-500 font-medium mb-1">ดอกเบี้ยสะสมถึงวันนี้</p>
                        <p className="text-3xl font-bold text-slate-900">{interest.toLocaleString()} <span className="text-lg font-normal text-slate-400">บาท</span></p>
                      </div>
                      <div className="text-right">
                        <p className="text-xs text-slate-500 font-medium mb-1">ยอดรวมไถ่ถอน</p>
                        <p className="text-xl font-bold text-emerald-600">{(pawn.principal + interest).toLocaleString()} ฿</p>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              <div className="bg-emerald-50 rounded-2xl p-4 border border-emerald-100 flex items-center gap-3 text-emerald-700">
                <Clock size={20} className="shrink-0" />
                <p className="text-sm">กรุณามาไถ่ถอนหรือต่อดอกเบี้ยก่อนวันที่ครบกำหนดเพื่อรักษาเครื่องของท่าน</p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
