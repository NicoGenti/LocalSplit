import React, { useEffect } from 'react';
import { X } from 'lucide-react';
import { AddExpense } from './AddExpense';

interface AddExpenseModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function AddExpenseModal({ isOpen, onClose }: AddExpenseModalProps) {
  // Close on Escape key
  useEffect(() => {
    if (!isOpen) return;
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 bg-black/50 z-50 flex items-end sm:items-center justify-center"
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div className="bg-white dark:bg-gray-800 w-full sm:max-w-lg sm:mx-4 sm:rounded-2xl rounded-t-2xl max-h-[90vh] flex flex-col overflow-hidden transition-colors duration-200">
        {/* Header */}
        <div className="flex justify-between items-center px-5 py-4 border-b border-gray-100 dark:border-gray-700 shrink-0">
          <h2 className="text-lg font-semibold text-gray-800 dark:text-white">Aggiungi Spesa</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 p-1 rounded-lg transition-colors"
            aria-label="Chiudi"
          >
            <X size={20} />
          </button>
        </div>
        {/* Body — AddExpense form without its own card wrapper */}
        <div className="overflow-y-auto flex-1 p-5">
          <AddExpense onSuccess={onClose} asModal />
        </div>
      </div>
    </div>
  );
}
