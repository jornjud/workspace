"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { getVisiblePhones, Phone } from "@/lib/phones-firestore";

const APP_VERSION = "0.2.1"; // Version 0.2.1 - เพิ่มรหัสสินค้า + Version

export default function Home() {
  const [phones, setPhones] = useState<Phone[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedBrand, setSelectedBrand] = useState<string>("all");
  const [selectedImage, setSelectedImage] = useState<string | null>(null);

  useEffect(() => {
    loadPhones();
  }, []);

  const loadPhones = async () => {
    try {
      setLoading(true);
      const data = await getVisiblePhones();
      setPhones(data);
    } catch (err) {
      console.error("Error loading phones:", err);
    } finally {
      setLoading(false);
    }
  };

  // Group phones by brand
  const brands = Array.from(new Set(phones.map(p => {
    if (p.model.includes("OPPO")) return "OPPO";
    if (p.model.includes("Samsung")) return "Samsung";
    if (p.model.includes("Redmi")) return "Redmi";
    if (p.model.includes("Vivo")) return "Vivo";
    if (p.model.includes("Realme")) return "Realme";
    return "อื่นๆ";
  })));

  const filteredPhones = selectedBrand === "all" 
    ? phones 
    : phones.filter(p => {
        if (selectedBrand === "OPPO") return p.model.includes("OPPO");
        if (selectedBrand === "Samsung") return p.model.includes("Samsung");
        if (selectedBrand === "Redmi") return p.model.includes("Redmi");
        if (selectedBrand === "Vivo") return p.model.includes("Vivo");
        if (selectedBrand === "Realme") return p.model.includes("Realme");
        return false;
      });

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">กำลังโหลดสินค้า...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navbar */}
      <nav className="bg-white shadow-sm sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-4 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-indigo-600">📱 SecondPhone</h1>
          <Link 
            href="/admin" 
            className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition"
          >
            ⚙️ จัดการสินค้า
          </Link>
        </div>
      </nav>

      {/* Hero */}
      <section className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white py-16">
        <div className="max-w-6xl mx-auto px-4 text-center">
          <h2 className="text-4xl font-bold mb-4">มือถือมือสอง สภาพดี ราคาถูก</h2>
          <p className="text-xl opacity-90">รีวิวสภาพจริงทุกเครื่อง ซื้ออย่างมั่นใจ</p>
        </div>
      </section>

      {/* Brand Filter */}
      <section className="max-w-6xl mx-auto px-4 py-6">
        <div className="flex flex-wrap gap-2 justify-center">
          <button
            onClick={() => setSelectedBrand("all")}
            className={`px-4 py-2 rounded-full font-medium transition ${
              selectedBrand === "all" 
                ? "bg-indigo-600 text-white" 
                : "bg-white text-gray-700 hover:bg-gray-100"
            }`}
          >
            📱 ทั้งหมด ({phones.length})
          </button>
          {brands.map(brand => (
            <button
              key={brand}
              onClick={() => setSelectedBrand(brand)}
              className={`px-4 py-2 rounded-full font-medium transition ${
                selectedBrand === brand 
                  ? "bg-indigo-600 text-white" 
                  : "bg-white text-gray-700 hover:bg-gray-100"
              }`}
            >
              {brand} ({phones.filter(p => p.model.includes(brand)).length})
            </button>
          ))}
        </div>
      </section>

      {/* Products Grid */}
      <section className="max-w-6xl mx-auto px-4 py-4">
        <h3 className="text-2xl font-semibold mb-6">
          📦 สินค้าที่มีขาย ({filteredPhones.length} เครื่อง)
          {selectedBrand !== "all" && <span className="text-lg font-normal text-gray-500 ml-2">- {selectedBrand}</span>}
        </h3>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredPhones.map((phone) => (
            <Link 
              href={`/phones/${phone.id}`} 
              key={phone.id}
              className="phone-card bg-white rounded-xl shadow-md overflow-hidden transition-all duration-300 hover:shadow-lg block"
            >
              <div className="relative">
                <img 
                  src={phone.images?.[0] || "/placeholder-phone.jpg"} 
                  alt={phone.model} 
                  className="w-full h-48 object-cover cursor-zoom-in"
                  onClick={(e) => {
                    e.preventDefault();
                    setSelectedImage(phone.images?.[0] || "");
                  }}
                />
                <span className="absolute top-2 right-2 bg-yellow-400 text-gray-800 text-xs font-bold px-2 py-1 rounded">
                  มือสอง
                </span>
                {phone.status === "ติดจอง" && (
                  <span className="absolute top-2 left-2 bg-red-500 text-white text-xs font-bold px-2 py-1 rounded">
                    🔒 ติดจอง
                  </span>
                )}
              </div>
              <div className="p-4">
                <div className="flex items-center justify-between">
                  <h4 className="font-semibold text-lg">{phone.model}</h4>
                  <span className="text-xs text-gray-400 font-mono bg-gray-100 px-2 py-1 rounded">
                    {phone.code}
                  </span>
                </div>
                <p className="text-gray-500 text-sm">{phone.storage} • {phone.color}</p>
                
                <div className="mt-3 flex items-center gap-2">
                  <span className="text-2xl font-bold text-indigo-600">฿{phone.price.toLocaleString()}</span>
                </div>
                
                <div className="mt-2 flex gap-2 flex-wrap">
                  <span className={`inline-block px-2 py-1 rounded text-xs font-medium ${
                    phone.condition === "9/10" ? "bg-green-100 text-green-700" :
                    phone.condition === "8/10" ? "bg-blue-100 text-blue-700" :
                    "bg-orange-100 text-orange-700"
                  }`}>
                    สภาพ {phone.condition}
                  </span>
                  {phone.status === "ติดจอง" && (
                    <span className="inline-block px-2 py-1 rounded text-xs font-medium bg-red-100 text-red-700">
                      🔒 ติดจอง
                    </span>
                  )}
                </div>
                
                <p className="text-gray-500 text-sm mt-2 line-clamp-2">
                  {phone.conditionNote}
                </p>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-800 text-white py-8 mt-12">
        <div className="max-w-6xl mx-auto px-4 text-center">
          <p>📱 SecondPhone - มือถือมือสอง รีวิวจริง ขายตรงจากเจ้าของ</p>
          <p className="text-gray-400 text-sm mt-2">เวอร์ชัน {APP_VERSION}</p>
        </div>
      </footer>

      {/* Image Modal */}
      {selectedImage && (
        <div 
          className="fixed inset-0 bg-black/80 z-[100] flex items-center justify-center p-4"
          onClick={() => setSelectedImage(null)}
        >
          <div className="relative max-w-4xl max-h-[90vh]">
            <img 
              src={selectedImage} 
              alt="Preview" 
              className="max-w-full max-h-[90vh] object-contain rounded-lg"
            />
            <button
              onClick={() => setSelectedImage(null)}
              className="absolute -top-4 -right-4 bg-white text-gray-800 w-10 h-10 rounded-full text-xl font-bold hover:bg-gray-200 flex items-center justify-center"
            >
              ✕
            </button>
          </div>
      </div>
        )}
    </div>
  );
}
