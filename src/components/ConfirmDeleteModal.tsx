import React, { useEffect, useRef } from 'react';
import { Trash2, CheckCircle2 } from 'lucide-react';
import { useTranslation } from '../i18n/index';

interface ConfirmDeleteModalProps {
  isOpen: boolean;
  onConfirm: () => void;
  onCancel: () => void;
  message?: string;
  confirmLabel?: string;
  variant?: 'delete' | 'confirm';
}

export function ConfirmDeleteModal({ isOpen, onConfirm, onCancel, message, confirmLabel, variant = 'delete' }: ConfirmDeleteModalProps) {
  const noButtonRef = useRef<HTMLButtonElement>(null);
  const { t } = useTranslation();

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

  const isConfirmVariant = variant === 'confirm';

  return (
    <div
      className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
      onClick={(e) => { if (e.target === e.currentTarget) onCancel(); }}
      role="dialog"
      aria-modal="true"
      aria-labelledby="confirm-modal-title"
    >
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl w-full max-w-sm p-6 flex flex-col gap-4 transition-colors duration-200">
        <div className="flex flex-col items-center gap-3 text-center">
          <div className={`w-12 h-12 rounded-full flex items-center justify-center ${isConfirmVariant ? 'bg-green-100 dark:bg-green-900/30' : 'bg-red-100 dark:bg-red-900/30'}`}>
            {isConfirmVariant
              ? <CheckCircle2 size={22} className="text-green-600 dark:text-green-400" />
              : <Trash2 size={22} className="text-red-600 dark:text-red-400" />
            }
          </div>
          <h2 id="confirm-modal-title" className="text-lg font-semibold text-gray-800 dark:text-white">
            {message ?? t('confirmDelete.title')}
          </h2>
        </div>
        <div className="flex gap-3">
          <button
            ref={noButtonRef}
            onClick={onCancel}
            className="flex-1 bg-gray-800 dark:bg-gray-200 text-white dark:text-gray-900 px-4 py-3 rounded-lg font-bold hover:bg-gray-700 dark:hover:bg-gray-300 transition-colors focus:outline-none focus:ring-2 focus:ring-gray-500"
          >
            {t('confirmDelete.no')}
          </button>
          <button
            onClick={onConfirm}
            className={`flex-1 px-4 py-3 rounded-lg font-bold transition-colors focus:outline-none focus:ring-2 ${
              isConfirmVariant
                ? 'bg-green-600 text-white hover:bg-green-700 focus:ring-green-400'
                : 'border border-red-300 dark:border-red-700 text-red-500 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 focus:ring-red-300'
            }`}
          >
            {confirmLabel ?? t('confirmDelete.yes')}
          </button>
        </div>
      </div>
    </div>
  );
}
