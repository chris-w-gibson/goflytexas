"use client";

import { useState } from 'react';
import { Camera, ImageIcon } from 'lucide-react';
import { useImageEdit } from './ImageEditContext';
import ImagePicker from './ImagePicker';

interface EditableImageProps {
  locationId: string;
  alt: string;
  className?: string;
  fallback?: React.ReactNode;
  aspectRatio?: string;
}

export default function EditableImage({
  locationId,
  alt,
  className = '',
  fallback,
  aspectRatio = 'aspect-[4/3]'
}: EditableImageProps) {
  const { editMode, getImage } = useImageEdit();
  const [showPicker, setShowPicker] = useState(false);
  const imagePath = getImage(locationId);

  if (editMode) {
    return (
      <>
        <div
          onClick={() => setShowPicker(true)}
          className={`relative cursor-pointer group ${aspectRatio} ${className}`}
        >
          {imagePath ? (
            <img src={imagePath} alt={alt} className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full bg-gray-200 flex items-center justify-center">
              <div className="text-center text-gray-500">
                <ImageIcon className="h-12 w-12 mx-auto mb-2" />
                <p className="text-sm">No image selected</p>
              </div>
            </div>
          )}

          {/* Edit Overlay */}
          <div className="absolute inset-0 bg-sky-600/80 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
            <div className="text-white text-center">
              <Camera className="h-10 w-10 mx-auto mb-2" />
              <p className="font-semibold">Click to change</p>
              <p className="text-sm opacity-80">{locationId}</p>
            </div>
          </div>

          {/* Edit Badge */}
          <div className="absolute top-2 left-2 bg-sky-600 text-white px-2 py-1 rounded text-xs font-medium">
            EDIT
          </div>
        </div>

        {showPicker && (
          <ImagePicker
            locationId={locationId}
            currentImage={imagePath}
            onClose={() => setShowPicker(false)}
          />
        )}
      </>
    );
  }

  // Normal display mode
  if (!imagePath) {
    return fallback || null;
  }

  return (
    <img src={imagePath} alt={alt} className={`${className}`} />
  );
}
