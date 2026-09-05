"use client";

import { useState } from 'react';
import Image from 'next/image';
import { ChevronLeft, ChevronRight, Camera, X } from 'lucide-react';
import { useImageEdit } from './ImageEditContext';
import ImagePicker from './ImagePicker';

interface ImageCarouselProps {
  locationPrefix: string; // e.g., "aircraft-n4501e"
  imageCount?: number;
  className?: string;
}

export default function ImageCarousel({
  locationPrefix,
  imageCount = 5,
  className = ''
}: ImageCarouselProps) {
  const { editMode, getImage, setImage } = useImageEdit();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [showPicker, setShowPicker] = useState(false);
  const [editingSlot, setEditingSlot] = useState<string | null>(null);
  const [lightboxOpen, setLightboxOpen] = useState(false);

  // Generate slot IDs: main, slot-1, slot-2, etc.
  const slots = [
    { id: `${locationPrefix}-main`, label: 'Main' },
    ...Array.from({ length: imageCount - 1 }, (_, i) => ({
      id: `${locationPrefix}-${i + 1}`,
      label: `Image ${i + 1}`
    }))
  ];

  // Get images that have been assigned
  const assignedSlots = slots.filter(slot => getImage(slot.id));
  const displaySlots = editMode ? slots : assignedSlots;

  const currentSlot = displaySlots[currentIndex] || displaySlots[0];
  const currentImage = currentSlot ? getImage(currentSlot.id) : null;

  const goToPrevious = () => {
    setCurrentIndex(prev => (prev === 0 ? displaySlots.length - 1 : prev - 1));
  };

  const goToNext = () => {
    setCurrentIndex(prev => (prev === displaySlots.length - 1 ? 0 : prev + 1));
  };

  const openPicker = (slotId: string) => {
    setEditingSlot(slotId);
    setShowPicker(true);
  };

  if (displaySlots.length === 0) {
    return (
      <div className={`bg-gray-200 flex items-center justify-center ${className}`}>
        <div className="text-center text-gray-500 p-8">
          <Camera className="h-12 w-12 mx-auto mb-2" />
          <p>No images assigned</p>
          {editMode && (
            <button
              onClick={() => openPicker(slots[0].id)}
              className="mt-4 px-4 py-2 bg-sky-600 text-white rounded-lg"
            >
              Add First Image
            </button>
          )}
        </div>
      </div>
    );
  }

  return (
    <>
      <div className={`relative ${className}`}>
        {/* Main Image Display */}
        <div
          className="relative aspect-[4/3] bg-gray-100 overflow-hidden cursor-pointer"
          onClick={() => !editMode && currentImage && setLightboxOpen(true)}
        >
          {currentImage ? (
            <Image
              src={currentImage}
              alt={currentSlot?.label || 'Aircraft image'}
              fill
              sizes="(max-width: 1024px) 100vw, 60vw"
              className="object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-gray-200">
              <div className="text-center text-gray-500">
                <Camera className="h-8 w-8 mx-auto mb-2" />
                <p className="text-sm">Empty slot</p>
              </div>
            </div>
          )}

          {/* Edit Mode Overlay */}
          {editMode && (
            <button
              onClick={() => openPicker(currentSlot.id)}
              className="absolute inset-0 bg-sky-600/80 opacity-0 hover:opacity-100 transition-opacity flex items-center justify-center"
            >
              <div className="text-white text-center">
                <Camera className="h-10 w-10 mx-auto mb-2" />
                <p className="font-semibold">Click to change</p>
                <p className="text-sm opacity-80">{currentSlot.id}</p>
              </div>
            </button>
          )}

          {/* Navigation Arrows */}
          {displaySlots.length > 1 && (
            <>
              <button
                onClick={(e) => { e.stopPropagation(); goToPrevious(); }}
                className="absolute left-2 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white p-2 rounded-full transition-colors"
              >
                <ChevronLeft className="h-6 w-6" />
              </button>
              <button
                onClick={(e) => { e.stopPropagation(); goToNext(); }}
                className="absolute right-2 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white p-2 rounded-full transition-colors"
              >
                <ChevronRight className="h-6 w-6" />
              </button>
            </>
          )}

          {/* Image Counter */}
          {displaySlots.length > 1 && (
            <div className="absolute bottom-2 right-2 bg-black/60 text-white px-3 py-1 rounded-full text-sm">
              {currentIndex + 1} / {displaySlots.length}
            </div>
          )}

          {/* Edit Badge */}
          {editMode && (
            <div className="absolute top-2 left-2 bg-sky-600 text-white px-2 py-1 rounded text-xs font-medium">
              EDIT
            </div>
          )}
        </div>

        {/* Thumbnail Strip */}
        <div className="flex gap-2 mt-2 overflow-x-auto pb-2">
          {displaySlots.map((slot, index) => {
            const thumbImage = getImage(slot.id);
            return (
              <button
                key={slot.id}
                onClick={() => editMode ? openPicker(slot.id) : setCurrentIndex(index)}
                className={`relative flex-shrink-0 w-16 h-16 rounded-lg overflow-hidden border-2 transition-all ${
                  index === currentIndex
                    ? 'border-sky-500 ring-2 ring-sky-300'
                    : 'border-gray-200 hover:border-gray-400'
                }`}
              >
                {thumbImage ? (
                  <Image
                    src={thumbImage}
                    alt={slot.label}
                    fill
                    sizes="64px"
                    className="object-cover"
                  />
                ) : (
                  <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                    <Camera className="h-4 w-4 text-gray-400" />
                  </div>
                )}
                {editMode && (
                  <div className="absolute inset-0 bg-sky-600/60 opacity-0 hover:opacity-100 transition-opacity flex items-center justify-center">
                    <Camera className="h-4 w-4 text-white" />
                  </div>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Image Picker Modal */}
      {showPicker && editingSlot && (
        <ImagePicker
          locationId={editingSlot}
          currentImage={getImage(editingSlot)}
          onClose={() => {
            setShowPicker(false);
            setEditingSlot(null);
          }}
        />
      )}

      {/* Lightbox */}
      {lightboxOpen && currentImage && (
        <div
          className="fixed inset-0 bg-black/90 z-[100] flex items-center justify-center p-4"
          onClick={() => setLightboxOpen(false)}
        >
          <button
            className="absolute top-4 right-4 text-white hover:text-gray-300"
            onClick={() => setLightboxOpen(false)}
          >
            <X className="h-8 w-8" />
          </button>

          <img
            src={currentImage}
            alt="Full size"
            className="max-w-full max-h-full object-contain"
            onClick={(e) => e.stopPropagation()}
          />

          {displaySlots.length > 1 && (
            <>
              <button
                onClick={(e) => { e.stopPropagation(); goToPrevious(); }}
                className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/20 hover:bg-white/40 text-white p-3 rounded-full transition-colors"
              >
                <ChevronLeft className="h-8 w-8" />
              </button>
              <button
                onClick={(e) => { e.stopPropagation(); goToNext(); }}
                className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/20 hover:bg-white/40 text-white p-3 rounded-full transition-colors"
              >
                <ChevronRight className="h-8 w-8" />
              </button>
            </>
          )}
        </div>
      )}
    </>
  );
}
