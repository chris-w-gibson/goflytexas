"use client";

import { useState, ReactNode } from 'react';
import { Camera, ImageIcon } from 'lucide-react';
import { useImageEdit } from './ImageEditContext';
import ImagePicker from './ImagePicker';

interface EditableBackgroundProps {
  locationId: string;
  children: ReactNode;
  className?: string;
  overlayClassName?: string;
  fallbackClassName?: string;
}

export default function EditableBackground({
  locationId,
  children,
  className = '',
  overlayClassName = 'bg-black/50',
  fallbackClassName = 'bg-gradient-to-r from-sky-600 to-sky-700',
}: EditableBackgroundProps) {
  const { editMode, getImage } = useImageEdit();
  const [showPicker, setShowPicker] = useState(false);
  const imagePath = getImage(locationId);

  const backgroundStyle = imagePath
    ? { backgroundImage: `url(${imagePath})`, backgroundSize: 'cover', backgroundPosition: 'center' }
    : {};

  const baseClassName = imagePath ? '' : fallbackClassName;

  if (editMode) {
    return (
      <>
        <div className={`relative ${baseClassName} ${className}`} style={backgroundStyle}>
          {/* Overlay for readability */}
          {imagePath && <div className={`absolute inset-0 ${overlayClassName}`} />}

          {/* Content */}
          <div className="relative z-10">{children}</div>

          {/* Edit Button */}
          <button
            onClick={() => setShowPicker(true)}
            className="absolute top-4 right-4 z-20 bg-sky-600 hover:bg-sky-700 text-white px-4 py-2 rounded-lg shadow-lg flex items-center gap-2 transition-colors"
          >
            <Camera className="h-5 w-5" />
            <span className="font-medium">Edit Background</span>
          </button>

          {/* Location Label */}
          <div className="absolute top-4 left-4 z-20 bg-sky-600 text-white px-2 py-1 rounded text-xs font-medium">
            BG: {locationId}
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
  return (
    <div className={`relative ${baseClassName} ${className}`} style={backgroundStyle}>
      {imagePath && <div className={`absolute inset-0 ${overlayClassName}`} />}
      <div className="relative z-10">{children}</div>
    </div>
  );
}
