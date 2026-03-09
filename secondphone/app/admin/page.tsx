"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { 
  getAllPhones, 
  addPhone, 
  updatePhone, 
  deletePhone, 
  Phone 
} from "@/lib/phones-firestore";

const ADMIN_PASSWORD = "sumax298298";
const APP_VERSION = "0.2.1";

export default function AdminPage() {
  const [phones, setPhones] = useState<Phone[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [editingPhone, setEditingPhone] = useState<Phone | null>(null);
  const [showHidden, setShowHidden] = useState(false);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    code: "",
    model: "",
    storage: "",
    color: "",
    price: "",
    condition: "",
    conditionNote: "",
    specs: "",
    year: "",
    status: "ว่าง",
    hidden: false,
  });

  // Load phones from Firestore
  const loadPhones = async () => {
    try {
      setLoading(true);
      const data = await getAllPhones();
      setPhones(data);
    } catch (err) {
      console.error("Error loading phones:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isAuthenticated) {
      loadPhones();
    }
  }, [isAuthenticated]);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (password === ADMIN_PASSWORD) {
      setIsAuthenticated(true);
      setError("");
    } else {
      setError("รหัสผ่านไม่ถูกต้อง");
    }
  };

  const handleEdit = (phone: Phone) => {
    setEditingPhone(phone);
    setFormData({
      code: phone.code || "",
      model: phone.model,
      storage: phone.storage,
      color: phone.color,
      price: phone.price.toString(),
      condition: phone.condition,
      conditionNote: phone.conditionNote,
      specs: phone.specs,
      year: phone.year.toString(),
      status: phone.status || "ว่าง",
      hidden: phone.hidden || false,
    });
  };

  const handleSave = async () => {
    if (!editingPhone) return;
    
    try {
      setSaving(true);
      await updatePhone(editingPhone.id, {
        code: formData.code,
        model: formData.model,
        storage: formData.storage,
        color: formData.color,
        price: parseInt(formData.price),
        condition: formData.condition,
        conditionNote: formData.conditionNote,
        specs: formData.specs,
        year: parseInt(formData.year),
        status: formData.status,
        hidden: formData.hidden,
      });
      
      alert("✅ บันทึกสำเร็จ!");
      setEditingPhone(null);
      loadPhones();
    } catch (err) {
      console.error("Error saving:", err);
      alert("❌ เกิดข้อผิดพลาด ลองใหม่อีกครั้ง");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("⚠️ ต้องการลบสินค้านี้ใช่หรือไม่? การลบไม่สามารถยกเลิกได้!")) {
      return;
    }
    
    try {
      await deletePhone(id);
      alert("✅ ลบสำเร็จ!");
      loadPhones();
    } catch (err) {
      console.error("Error deleting:", err);
      alert("❌ เกิดข้อผิดพลาดในการลบ");
    }
  };

  const handleCancel = () => {
    setEditingPhone(null);
    setFormData({
      code: "",
      model: "",
      storage: "",
      color: "",
      price: "",
      condition: "",
      conditionNote: "",
      specs: "",
      year: "",
      status: "ว่าง",
      hidden: false,
    });
  };

  const displayedPhones = showHidden ? phones : phones.filter(p => !p.hidden);

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="bg-white p-8 rounded-xl shadow-lg max-w-md w-full">
          <h1 className="text-2xl font-bold text-center mb-6">🔐 SecondPhone Admin</h1>
          <form onSubmit={handleLogin}>
            <div className="mb-4">
              <label className="block text-sm font-medium mb-2">รหัสผ่าน</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500"
                placeholder="กรอกรหัสผ่าน"
              />
            </div>
            {error && <p className="text-red-500 mb-4">{error}</p>}
            <button
              type="submit"
              className="w-full bg-indigo-600 text-white py-2 rounded-lg hover:bg-indigo-700"
            >
              เข้าสู่ระบบ
            </button>
          </form>
          <Link href="/" className="block text-center mt-4 text-gray-500 hover:underline">
            ← กลับหน้าหลัก
          </Link>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">กำลังโหลดข้อมูล...</p>
        </div>
      </div>
    );
  }

  if (editingPhone) {
    return (
      <div className="min-h-screen bg-gray-50">
        <nav className="bg-white shadow-sm sticky top-0 z-50">
          <div className="max-w-6xl mx-auto px-4 py-4 flex justify-between items-center">
            <Link href="/" className="text-2xl font-bold text-indigo-600">📱 SecondPhone</Link>
            <span className="text-green-600 font-medium">✓ Admin Mode</span>
          </div>
        </nav>

        <div className="max-w-3xl mx-auto px-4 py-8">
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h2 className="text-2xl font-bold mb-6">✏️ แก้ไขสินค้า</h2>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">รหัสสินค้า</label>
                <input
                  type="text"
                  value={formData.code}
                  onChange={(e) => setFormData({...formData, code: e.target.value})}
                  className="w-full px-4 py-2 border rounded-lg font-mono"
                  placeholder="SP-001"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">รุ่น</label>
                <input
                  type="text"
                  value={formData.model}
                  onChange={(e) => setFormData({...formData, model: e.target.value})}
                  className="w-full px-4 py-2 border rounded-lg"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">RAM/ROM</label>
                <input
                  type="text"
                  value={formData.storage}
                  onChange={(e) => setFormData({...formData, storage: e.target.value})}
                  className="w-full px-4 py-2 border rounded-lg"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">สี</label>
                <input
                  type="text"
                  value={formData.color}
                  onChange={(e) => setFormData({...formData, color: e.target.value})}
                  className="w-full px-4 py-2 border rounded-lg"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">ราคา (บาท)</label>
                <input
                  type="number"
                  value={formData.price}
                  onChange={(e) => setFormData({...formData, price: e.target.value})}
                  className="w-full px-4 py-2 border rounded-lg"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">สภาพ</label>
                <input
                  type="text"
                  value={formData.condition}
                  onChange={(e) => setFormData({...formData, condition: e.target.value})}
                  className="w-full px-4 py-2 border rounded-lg"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">ปี</label>
                <input
                  type="number"
                  value={formData.year}
                  onChange={(e) => setFormData({...formData, year: e.target.value})}
                  className="w-full px-4 py-2 border rounded-lg"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">สถานะ</label>
                <select
                  value={formData.status}
                  onChange={(e) => setFormData({...formData, status: e.target.value})}
                  className="w-full px-4 py-2 border rounded-lg"
                >
                  <option value="ว่าง">ว่าง</option>
                  <option value="ติดจอง">ติดจอง</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">ซ่อนจากหน้าหลัก</label>
                <select
                  value={formData.hidden.toString()}
                  onChange={(e) => setFormData({...formData, hidden: e.target.value === "true"})}
                  className="w-full px-4 py-2 border rounded-lg"
                >
                  <option value="false">แสดง</option>
                  <option value="true">ซ่อน</option>
                </select>
              </div>
              <div className="col-span-2">
                <label className="block text-sm font-medium mb-1">สเปค</label>
                <input
                  type="text"
                  value={formData.specs}
                  onChange={(e) => setFormData({...formData, specs: e.target.value})}
                  className="w-full px-4 py-2 border rounded-lg"
                />
              </div>
              <div className="col-span-2">
                <label className="block text-sm font-medium mb-1">รายละเอียดสภาพ</label>
                <textarea
                  value={formData.conditionNote}
                  onChange={(e) => setFormData({...formData, conditionNote: e.target.value})}
                  className="w-full px-4 py-2 border rounded-lg"
                  rows={3}
                />
              </div>
            </div>

            <div className="mt-6 flex gap-3">
              <button
                onClick={handleSave}
                disabled={saving}
                className="flex-1 bg-indigo-600 text-white py-2 rounded-lg hover:bg-indigo-700 disabled:opacity-50"
              >
                {saving ? "กำลังบันทึก..." : "💾 บันทึก"}
              </button>
              <button
                onClick={handleCancel}
                className="flex-1 bg-gray-500 text-white py-2 rounded-lg hover:bg-gray-600"
              >
                ยกเลิก
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow-sm sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-4 py-4 flex justify-between items-center">
          <Link href="/" className="text-2xl font-bold text-indigo-600">📱 SecondPhone</Link>
          <div className="flex items-center gap-4">
            <span className="text-green-600 font-medium">✓ Admin Mode</span>
            <button 
              onClick={() => setIsAuthenticated(false)}
              className="text-gray-500 hover:text-gray-700"
            >
              ออกจากระบบ
            </button>
          </div>
        </div>
      </nav>

      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">⚙️ จัดการสินค้า</h1>
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={showHidden}
              onChange={(e) => setShowHidden(e.target.checked)}
              className="w-4 h-4"
            />
            <span className="text-sm">แสดงสินค้าที่ซ่อนไว้</span>
          </label>
        </div>
        
        <div className="bg-white rounded-xl shadow-lg overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-sm font-medium">รหัส</th>
                <th className="px-4 py-3 text-left text-sm font-medium">รุ่น</th>
                <th className="px-4 py-3 text-left text-sm font-medium">สเปค</th>
                <th className="px-4 py-3 text-left text-sm font-medium">สี</th>
                <th className="px-4 py-3 text-left text-sm font-medium">ราคา</th>
                <th className="px-4 py-3 text-left text-sm font-medium">สภาพ</th>
                <th className="px-4 py-3 text-left text-sm font-medium">สถานะ</th>
                <th className="px-4 py-3 text-left text-sm font-medium">แสดง</th>
                <th className="px-4 py-3 text-left text-sm font-medium">จัดการ</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {displayedPhones.map((phone) => (
                <tr key={phone.id} className={`hover:bg-gray-50 ${phone.hidden ? 'bg-red-50' : ''}`}>
                  <td className="px-4 py-3 font-mono text-sm">{phone.code || '-'}</td>
                  <td className="px-4 py-3">{phone.model}</td>
                  <td className="px-4 py-3 text-sm text-gray-500">{phone.storage}</td>
                  <td className="px-4 py-3 text-sm text-gray-500">{phone.color}</td>
                  <td className="px-4 py-3 font-medium">฿{phone.price.toLocaleString()}</td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-1 rounded text-xs ${
                      phone.condition === "9/10" ? "bg-green-100 text-green-700" :
                      phone.condition === "8/10" ? "bg-blue-100 text-blue-700" :
                      "bg-orange-100 text-orange-700"
                    }`}>
                      {phone.condition}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-1 rounded text-xs ${
                      phone.status === "ติดจอง" ? "bg-red-100 text-red-700" : "bg-green-100 text-green-700"
                    }`}>
                      {phone.status || "ว่าง"}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    {phone.hidden ? (
                      <span className="text-red-500 text-xs">❌ ซ่อน</span>
                    ) : (
                      <span className="text-green-600 text-xs">✅ แสดง</span>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <button
                      onClick={() => handleEdit(phone)}
                      className="text-indigo-600 hover:text-indigo-800 mr-3"
                    >
                      ✏️ แก้ไข
                    </button>
                    <button
                      onClick={() => handleDelete(phone.id)}
                      className="text-red-600 hover:text-red-800"
                    >
                      🗑️ ลบ
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="mt-6 p-4 bg-blue-50 rounded-lg">
          <p className="text-blue-800">
            📊 <strong>สถิติ:</strong> มีสินค้าทั้งหมด {phones.length} รายการ
            {' | '}
            <span className="text-green-600">ว่าง: {phones.filter(p => p.status !== 'ติดจอง').length}</span>
            {' | '}
            <span className="text-red-600">ติดจอง: {phones.filter(p => p.status === 'ติดจอง').length}</span>
          </p>
        </div>
      </div>
    </div>
  );
}
