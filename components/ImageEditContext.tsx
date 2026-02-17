"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { defaultImageConfig, ImageConfig } from '@/lib/imageConfig';

interface ImageEditContextType {
  editMode: boolean;
  toggleEditMode: () => void;
  images: ImageConfig;
  setImage: (locationId: string, imagePath: string | null) => void;
  getImage: (locationId: string) => string | null;
}

const ImageEditContext = createContext<ImageEditContextType | undefined>(undefined);

const STORAGE_KEY = 'goflytexas-images';

export function ImageEditProvider({ children }: { children: ReactNode }) {
  const [editMode, setEditMode] = useState(false);
  const [images, setImages] = useState<ImageConfig>(defaultImageConfig);

  // Load saved images from localStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        setImages({ ...defaultImageConfig, ...parsed });
      } catch (e) {
        console.error('Failed to parse saved images:', e);
      }
    }
  }, []);

  const toggleEditMode = () => {
    setEditMode(prev => !prev);
  };

  const setImage = (locationId: string, imagePath: string | null) => {
    setImages(prev => {
      const updated = { ...prev, [locationId]: imagePath };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
      return updated;
    });
  };

  const getImage = (locationId: string): string | null => {
    return images[locationId] ?? null;
  };

  return (
    <ImageEditContext.Provider value={{ editMode, toggleEditMode, images, setImage, getImage }}>
      {children}
    </ImageEditContext.Provider>
  );
}

export function useImageEdit() {
  const context = useContext(ImageEditContext);
  if (context === undefined) {
    throw new Error('useImageEdit must be used within an ImageEditProvider');
  }
  return context;
}
