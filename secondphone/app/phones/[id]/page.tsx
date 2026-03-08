import Link from "next/link";
import { notFound } from "next/navigation";
import { getPhoneById, phones } from "@/lib/phones";
import ImageModal from "./ImageModal";

export function generateStaticParams() {
  return phones.map((phone) => ({
    id: phone.id,
  }));
}

export default function PhoneDetail({ params }: { params: { id: string } }) {
  const phone = getPhoneById(params.id);
  
  if (!phone) {
    notFound();
  }

  const specsList = phone.specs.split(", ").map(s => s.trim());

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navbar */}
      <nav className="bg-white shadow-sm sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-4 py-4 flex justify-between items-center">
          <Link href="/" className="text-2xl font-bold text-indigo-600">📱 SecondPhone</Link>
          <Link 
            href="/admin" 
            className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition"
          >
            ⚙️ จัดการสินค้า
          </Link>
        </div>
      </nav>

      {/* Detail */}
      <section className="max-w-6xl mx-auto px-4 py-8">
        <Link href="/" className="text-indigo-600 hover:underline mb-4 inline-block">
          ← กลับไปหน้าหลัก
        </Link>
        
        <div className="bg-white rounded-xl shadow-lg p-6">
          <div className="grid md:grid-cols-2 gap-8">
            {/* Image Gallery */}
            <div>
              <ImageModal images={phone.images} model={phone.model} />
            </div>
            
            {/* Info */}
            <div>
              <h2 className="text-3xl font-bold">{phone.model}</h2>
              <p className="text-gray-500 mt-1">{phone.storage} • {phone.color}</p>
              
              <div className="mt-6">
                <span className="text-4xl font-bold text-indigo-600">฿{phone.price.toLocaleString()}</span>
              </div>
              
              <div className="mt-4 flex gap-2 flex-wrap">
                <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                  phone.condition === "9/10" ? "bg-green-100 text-green-700" :
                  phone.condition === "8/10" ? "bg-blue-100 text-blue-700" :
                  "bg-orange-100 text-orange-700"
                }`}>
                  สภาพ {phone.condition}
                </span>
                {phone.status === "ติดจอง" ? (
                  <span className="bg-red-100 text-red-700 px-3 py-1 rounded-full text-sm font-medium">
                    🔒 ติดจอง
                  </span>
                ) : (
                  <span className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-sm font-medium">
                    ✅ ว่าง
                  </span>
                )}
              </div>
              
              <div className="mt-6">
                <h4 className="font-semibold mb-2">📋 รายละเอียดสภาพ:</h4>
                <p className="text-gray-600 bg-gray-50 p-3 rounded-lg">
                  {phone.conditionNote}
                </p>
              </div>
              
              <div className="mt-6">
                <h4 className="font-semibold mb-2">⚙️ สเปค:</h4>
                <ul className="text-gray-600 space-y-1">
                  {specsList.map((spec, index) => (
                    <li key={index}>• {spec}</li>
                  ))}
                  <li>• ปี {phone.year}</li>
                </ul>
              </div>
              
              {phone.status !== "ติดจอง" && (
                <div className="mt-8 flex gap-3">
                  <a 
                    href="https://line.me/th/" 
                    target="_blank" 
                    className="flex-1 bg-green-500 text-white text-center py-3 rounded-lg font-medium hover:bg-green-600 transition"
                  >
                    💬 ติดต่อ LINE
                  </a>
                  <a 
                    href="tel:" 
                    className="flex-1 bg-gray-800 text-white text-center py-3 rounded-lg font-medium hover:bg-gray-900 transition"
                  >
                    📞 โทรติดต่อ
                  </a>
                </div>
              )}
              
              {phone.status === "ติดจอง" && (
                <div className="mt-8 bg-red-50 border border-red-200 rounded-lg p-4 text-center">
                  <p className="text-red-700 font-medium">🔒 สินค้าติดจองแล้ว</p>
                  <p className="text-red-600 text-sm mt-1">ติดต่อ LINE หากต้องการจอง</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-800 text-white py-8 mt-12">
        <div className="max-w-6xl mx-auto px-4 text-center">
          <p>📱 SecondPhone - มือถือมือสอง รีวิวจริง ขายตรงจากเจ้าของ</p>
          <p className="text-gray-400 text-sm mt-2">เวอร์ชัน 0.2.0</p>
        </div>
      </footer>
    </div>
  );
}
