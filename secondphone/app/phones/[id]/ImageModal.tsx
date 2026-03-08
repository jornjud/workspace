"use client";

import { useState } from "react";

export default function ImageModal({ images, model }: { images: string[], model: string }) {
  const [selectedImage, setSelectedImage] = useState(0);
  const [showFullscreen, setShowFullscreen] = useState(false);
  const [imageCount, setImageCount] = useState(images.length);

  // Filter images based on user selection
  const displayImages = images.slice(0, imageCount);

  return (
    <>
      {/* Image Count Selector */}
      <div className="mb-4 flex items-center gap-2">
        <label className="text-sm font-medium text-gray-700">📸 แสดงรูป:</label>
        <select
          value={imageCount}
          onChange={(e) => {
            setImageCount(Number(e.target.value));
            setSelectedImage(0); // Reset to first image
          }}
          className="border border-gray-300 rounded-lg px-3 py-1.5 text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
        >
          {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((num) => (
            <option key={num} value={num} disabled={num > images.length}>
              {num} รูป {num > images.length ? `(มี ${images.length} รูป)` : ''}
            </option>
          ))}
        </select>
        <span className="text-xs text-gray-500">(มีทั้งหมด {images.length} รูป)</span>
      </div>

      {/* Main Image */}
      <div className="relative">
        <img 
          src={displayImages[selectedImage]} 
          alt={model} 
          className="w-full rounded-lg shadow cursor-zoom-in"
          onClick={() => setShowFullscreen(true)}
        />
      </div>

      {/* Thumbnail Gallery */}
      {displayImages.length > 1 && (
        <div className="flex gap-2 mt-4 overflow-x-auto pb-2">
          {displayImages.map((img, index) => (
            <button
              key={index}
              onClick={() => setSelectedImage(index)}
              className={`flex-shrink-0 w-20 h-20 rounded-lg overflow-hidden border-2 transition ${
                selectedImage === index ? "border-indigo-600" : "border-gray-200 hover:border-gray-300"
              }`}
            >
              <img src={img} alt="" className="w-full h-full object-cover" />
            </button>
          ))}
        </div>
      )}

      {/* Full Screen Modal */}
      {showFullscreen && (
        <div 
          className="fixed inset-0 bg-black/90 z-[100] flex items-center justify-center p-4"
          onClick={() => setShowFullscreen(false)}
        >
          <div className="relative max-w-4xl max-h-[90vh]" onClick={(e) => e.stopPropagation()}>
            <img 
              src={displayImages[selectedImage]} 
              alt={model} 
              className="max-w-full max-h-[90vh] object-contain rounded-lg"
            />
            
            {/* Close Button */}
            <button
              onClick={() => setShowFullscreen(false)}
              className="absolute -top-4 -right-4 bg-white text-gray-800 w-10 h-10 rounded-full text-xl font-bold hover:bg-gray-200 flex items-center justify-center"
            >
              ✕
            </button>

            {/* Navigation */}
            {displayImages.length > 1 && (
              <>
                <button
                  onClick={() => setSelectedImage((prev) => (prev - 1 + displayImages.length) % displayImages.length)}
                  className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white text-gray-800 w-10 h-10 rounded-full flex items-center justify-center"
                >
                  ❮
                </button>
                <button
                  onClick={() => setSelectedImage((prev) => (prev + 1) % displayImages.length)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white text-gray-800 w-10 h-10 rounded-full flex items-center justify-center"
                >
                  ❯
                </button>
              </>
            )}
          </div>
        </div>
      )}
    </>
  );
}
