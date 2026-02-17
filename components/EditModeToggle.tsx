"use client";

import { Pencil, X } from 'lucide-react';
import { useImageEdit } from './ImageEditContext';

export default function EditModeToggle() {
  const { editMode, toggleEditMode } = useImageEdit();

  return (
    <button
      onClick={toggleEditMode}
      className={`fixed bottom-6 right-6 z-[90] flex items-center gap-2 px-4 py-3 rounded-full shadow-lg transition-all ${
        editMode
          ? 'bg-red-500 hover:bg-red-600 text-white'
          : 'bg-sky-600 hover:bg-sky-700 text-white'
      }`}
    >
      {editMode ? (
        <>
          <X className="h-5 w-5" />
          <span className="font-semibold">Exit Edit Mode</span>
        </>
      ) : (
        <>
          <Pencil className="h-5 w-5" />
          <span className="font-semibold">Edit Images</span>
        </>
      )}
    </button>
  );
}
