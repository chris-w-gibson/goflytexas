"use client";

import { useState } from 'react';
import { X, Image as ImageIcon, Trash2 } from 'lucide-react';
import { availableImages } from '@/lib/imageConfig';
import { useImageEdit } from './ImageEditContext';

interface ImagePickerProps {
  locationId: string;
  onClose: () => void;
  currentImage: string | null;
}

export default function ImagePicker({ locationId, onClose, currentImage }: ImagePickerProps) {
  const { setImage } = useImageEdit();
  const [filter, setFilter] = useState('');

  const filteredImages = availableImages.filter(img =>
    img.name.toLowerCase().includes(filter.toLowerCase()) ||
    img.path.toLowerCase().includes(filter.toLowerCase())
  );

  const handleSelect = (imagePath: string) => {
    setImage(locationId, imagePath);
    onClose();
  };

  const handleClear = () => {
    setImage(locationId, null);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/70 z-[100] flex items-center justify-center p-4" onClick={onClose}>
      <div
        className="bg-white rounded-xl max-w-4xl w-full max-h-[80vh] overflow-hidden shadow-2xl"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b bg-gray-50">
          <div>
            <h2 className="text-xl font-bold text-black">Select Image</h2>
            <p className="text-sm text-gray-600">Location: {locationId}</p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-gray-200 rounded-full transition-colors">
            <X className="h-6 w-6" />
          </button>
        </div>

        {/* Search/Filter */}
        <div className="p-4 border-b">
          <input
            type="text"
            placeholder="Filter images..."
            value={filter}
            onChange={e => setFilter(e.target.value)}
            className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-sky-500"
          />
        </div>

        {/* Current Selection */}
        {currentImage && (
          <div className="p-4 bg-sky-50 border-b flex items-center justify-between">
            <div className="flex items-center gap-3">
              <img src={currentImage} alt="Current" className="w-16 h-16 object-cover rounded" />
              <div>
                <p className="text-sm font-medium text-black">Current Image</p>
                <p className="text-xs text-gray-600">{currentImage}</p>
              </div>
            </div>
            <button
              onClick={handleClear}
              className="flex items-center gap-2 px-3 py-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-colors"
            >
              <Trash2 className="h-4 w-4" />
              Remove
            </button>
          </div>
        )}

        {/* Image Grid */}
        <div className="p-4 overflow-y-auto max-h-[50vh]">
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
            {filteredImages.map((img) => (
              <button
                key={img.path}
                onClick={() => handleSelect(img.path)}
                className={`group relative aspect-square rounded-lg overflow-hidden border-2 transition-all hover:border-sky-500 hover:shadow-lg ${
                  currentImage === img.path ? 'border-sky-500 ring-2 ring-sky-300' : 'border-gray-200'
                }`}
              >
                <img
                  src={img.path}
                  alt={img.name}
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-colors flex items-end">
                  <div className="w-full p-2 bg-gradient-to-t from-black/80 to-transparent opacity-0 group-hover:opacity-100 transition-opacity">
                    <p className="text-white text-xs font-medium truncate">{img.name}</p>
                  </div>
                </div>
                {currentImage === img.path && (
                  <div className="absolute top-2 right-2 bg-sky-500 text-white p-1 rounded-full">
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                )}
              </button>
            ))}
          </div>

          {filteredImages.length === 0 && (
            <div className="text-center py-12 text-gray-500">
              <ImageIcon className="h-12 w-12 mx-auto mb-3 opacity-50" />
              <p>No images match your filter</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
