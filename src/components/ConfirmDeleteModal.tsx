import React, { useEffect, useRef } from 'react';
import { Trash2 } from 'lucide-react';

interface ConfirmDeleteModalProps {
  isOpen: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

export function ConfirmDeleteModal({ isOpen, onConfirm, onCancel }: ConfirmDeleteModalProps) {
  const noButtonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (isOpen) noButtonRef.current?.focus();
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) return;
    const handleKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onCancel(); };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [isOpen, onCancel]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
      onClick={(e) => { if (e.target === e.currentTarget) onCancel(); }}
      role="dialog"
      aria-modal="true"
      aria-labelledby="confirm-delete-title"
    >
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl w-full max-w-sm p-6 flex flex-col gap-4 transition-colors duration-200">
        <div className="flex flex-col items-center gap-3 text-center">
          <div className="w-12 h-12 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center">
            <Trash2 size={22} className="text-red-600 dark:text-red-400" />
          </div>
          <h2 id="confirm-delete-title" className="text-lg font-semibold text-gray-800 dark:text-white">
            Sei sicuro di voler eliminare?
          </h2>
        </div>
        <div className="flex gap-3">
          <button
            ref={noButtonRef}
            onClick={onCancel}
            className="flex-1 bg-gray-800 dark:bg-gray-200 text-white dark:text-gray-900 px-4 py-3 rounded-lg font-bold hover:bg-gray-700 dark:hover:bg-gray-300 transition-colors focus:outline-none focus:ring-2 focus:ring-gray-500"
          >
            No
          </button>
          <button
            onClick={onConfirm}
            className="flex-1 border border-red-300 dark:border-red-700 text-red-500 dark:text-red-400 px-4 py-3 rounded-lg font-bold hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors focus:outline-none focus:ring-2 focus:ring-red-300"
          >
            Sì
          </button>
        </div>
      </div>
    </div>
  );
}
