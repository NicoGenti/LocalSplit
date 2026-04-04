import React, { useEffect } from 'react';
import { X, ArrowRight } from 'lucide-react';
import { Debt } from '../types';
import { useTranslation } from '../i18n/index';

const Avatar = ({ name, className }: { name: string; className?: string }) => (
  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white font-bold text-sm uppercase shrink-0 ${className}`}>
    {name.charAt(0)}
  </div>
);

interface ParticipantDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  userId: string;
  role: 'creditor' | 'debtor';
  debts: Debt[];
  getUserName: (id: string) => string;
}

export function ParticipantDetailModal({
  isOpen,
  onClose,
  userId,
  role,
  debts,
  getUserName,
}: ParticipantDetailModalProps) {
  const { t } = useTranslation();

  useEffect(() => {
    if (!isOpen) return;
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', handleKey);
    return () => document.removeEventListener('keydown', handleKey);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const name = getUserName(userId);

  const relatedDebts =
    role === 'creditor'
      ? debts.filter((d) => d.to === userId)
      : debts.filter((d) => d.from === userId);

  const title =
    role === 'creditor'
      ? t('participantDetail.titleCreditor', { name })
      : t('participantDetail.titleDebtor', { name });

  return (
    <div
      className="fixed inset-0 bg-black/50 z-50 flex items-end sm:items-center justify-center"
      onClick={onClose}
      aria-modal="true"
      role="dialog"
      aria-labelledby="participant-detail-title"
    >
      <div
        className="bg-white dark:bg-gray-800 w-full sm:max-w-lg sm:mx-4 sm:rounded-2xl rounded-t-2xl max-h-[90vh] flex flex-col overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center gap-3 p-4 border-b border-gray-100 dark:border-gray-700">
          <Avatar
            name={name}
            className={role === 'creditor' ? 'bg-green-500' : 'bg-red-500'}
          />
          <div className="flex-1 min-w-0">
            <h2
              id="participant-detail-title"
              className="font-semibold text-gray-800 dark:text-white truncate"
            >
              {name}
            </h2>
            <p className="text-xs text-gray-500 dark:text-gray-400 truncate">{title}</p>
          </div>
          <button
            onClick={onClose}
            aria-label={t('participantDetail.closeLabel')}
            className="p-1.5 rounded-lg text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors shrink-0"
          >
            <X size={18} />
          </button>
        </div>

        {/* Body */}
        <div className="overflow-y-auto p-4 space-y-2">
          {relatedDebts.length === 0 ? (
            <p className="text-center text-sm text-gray-500 dark:text-gray-400 py-4">
              {t('participantDetail.noDebts')}
            </p>
          ) : (
            relatedDebts.map((debt, i) => {
              const counterpartyId = role === 'creditor' ? debt.from : debt.to;
              const counterpartyName = getUserName(counterpartyId);
              const label =
                role === 'creditor'
                  ? t('participantDetail.owesYou', {
                      name: counterpartyName,
                      amount: debt.amount.toFixed(2),
                    })
                  : t('participantDetail.youOwe', {
                      name: counterpartyName,
                      amount: debt.amount.toFixed(2),
                    });

              return (
                <div
                  key={i}
                  className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-700/50 border border-gray-100 dark:border-gray-600 rounded-lg"
                >
                  <Avatar
                    name={counterpartyName}
                    className={role === 'creditor' ? 'bg-red-400' : 'bg-green-400'}
                  />
                  <span className="flex-1 text-sm font-medium text-gray-700 dark:text-gray-300 min-w-0 truncate">
                    {counterpartyName}
                  </span>
                  <ArrowRight
                    size={16}
                    className={
                      role === 'creditor'
                        ? 'text-green-500 shrink-0'
                        : 'text-red-500 shrink-0'
                    }
                  />
                  <span
                    className={`text-sm font-semibold shrink-0 ${
                      role === 'creditor'
                        ? 'text-green-600 dark:text-green-400'
                        : 'text-red-600 dark:text-red-400'
                    }`}
                    title={label}
                  >
                    {debt.amount.toFixed(2)} €
                  </span>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}
