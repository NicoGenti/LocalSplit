import React, { useState } from 'react';
import { useGroupStore } from '../store/useGroupStore';
import { SplitType, Split, Expense, ExpenseCategory } from '../types';
import { X, Check, Utensils, Bus, ShoppingBag } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { useTranslation } from '../i18n/index';

interface Props {
  expense: Expense;
  onClose: () => void;
}

export function EditExpenseModal({ expense, onClose }: Props) {
  const { users, updateExpense } = useGroupStore();
  const { t } = useTranslation();
  const [title, setTitle] = useState(expense.title);
  const [amount, setAmount] = useState(expense.amount.toString());
  const [payerId, setPayerId] = useState(expense.payerId);
  const [category, setCategory] = useState<ExpenseCategory | undefined>(expense.category);
  const [splitType, setSplitType] = useState<SplitType>(expense.splitType);
  const [selectedUsers, setSelectedUsers] = useState<Set<string>>(
    new Set(expense.splits.map(s => s.userId))
  );
  const [customAmounts, setCustomAmounts] = useState<Record<string, string>>(() => {
    const initial: Record<string, string> = {};
    if (expense.splitType === 'CUSTOM') {
      expense.splits.forEach(s => {
        initial[s.userId] = s.amount.toString();
      });
    }
    return initial;
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !amount || !payerId || selectedUsers.size === 0) return;

    const numAmount = parseFloat(amount);
    if (!Number.isFinite(numAmount) || numAmount <= 0) return;

    let splits: Split[] = [];
    
    if (splitType === 'EQUAL') {
      const splitAmount = numAmount / selectedUsers.size;
      splits = Array.from(selectedUsers).map((userId: string) => ({
        userId,
        amount: splitAmount
      }));
    } else {
      let sum = 0;
      splits = Array.from(selectedUsers).map((userId: string) => {
        const parsed = parseFloat(customAmounts[userId]);
        const amt = Number.isFinite(parsed) && parsed >= 0 ? parsed : 0;
        sum += amt;
        return { userId, amount: amt };
      });
      
      if (Math.abs(sum - numAmount) > 0.01) {
        toast.error(t('expense.customSumError', { sum: sum.toFixed(2), total: numAmount.toFixed(2) }));
        return;
      }
    }

    updateExpense(expense.id, {
      title,
      amount: numAmount,
      payerId,
      category,
      splitType,
      splits
    });

    toast.success(t('expense.editSuccess'));
    onClose();
  };

  const toggleUser = (userId: string) => {
    const newSet = new Set(selectedUsers);
    if (newSet.has(userId)) {
      newSet.delete(userId);
    } else {
      newSet.add(userId);
    }
    setSelectedUsers(newSet);
  };

  const toggleAll = () => {
    if (selectedUsers.size === users.length) {
      setSelectedUsers(new Set());
    } else {
      setSelectedUsers(new Set(users.map(u => u.id)));
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl w-full max-w-md overflow-hidden max-h-[90vh] flex flex-col transition-colors duration-200">
        <div className="flex justify-between items-center p-4 border-b border-gray-100 dark:border-gray-700 shrink-0 transition-colors">
          <h2 className="text-xl font-semibold text-gray-800 dark:text-white">{t('expense.editTitle')}</h2>
          <button onClick={onClose} className="text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 p-1 transition-colors">
            <X size={20} />
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="p-6 space-y-4 overflow-y-auto">
          <div>
            <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">{t('expense.title')}</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors"
              maxLength={100}
              required
            />
          </div>

          <div className="flex gap-4">
            <div className="flex-1">
              <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">{t('expense.amount')}</label>
              <input
                type="number"
                step="0.01"
                min="0.01"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors"
                required
              />
            </div>
            <div className="flex-1">
              <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">{t('expense.paidBy')}</label>
              <select
                value={payerId}
                onChange={(e) => setPayerId(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors"
                required
              >
                <option value="">Seleziona...</option>
                {users.map(u => (
                  <option key={u.id} value={u.id}>{u.name}</option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">{t('expense.category')}</label>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setCategory(category === 'cibo' ? undefined : 'cibo')}
                className={`flex-1 py-2 px-3 rounded-lg text-sm font-medium border transition-all flex items-center justify-center gap-2 ${
                  category === 'cibo'
                    ? 'bg-orange-50 dark:bg-orange-900/30 border-orange-500 text-orange-700 dark:text-orange-400 ring-1 ring-orange-500'
                    : 'bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-600'
                }`}
              >
                <Utensils size={16} />
                {t('expense.categories.food')}
              </button>
              <button
                type="button"
                onClick={() => setCategory(category === 'trasporti' ? undefined : 'trasporti')}
                className={`flex-1 py-2 px-3 rounded-lg text-sm font-medium border transition-all flex items-center justify-center gap-2 ${
                  category === 'trasporti'
                    ? 'bg-blue-50 dark:bg-blue-900/30 border-blue-500 text-blue-700 dark:text-blue-400 ring-1 ring-blue-500'
                    : 'bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-600'
                }`}
              >
                <Bus size={16} />
                {t('expense.categories.transport')}
              </button>
              <button
                type="button"
                onClick={() => setCategory(category === 'altro' ? undefined : 'altro')}
                className={`flex-1 py-2 px-3 rounded-lg text-sm font-medium border transition-all flex items-center justify-center gap-2 ${
                  category === 'altro'
                    ? 'bg-purple-50 dark:bg-purple-900/30 border-purple-500 text-purple-700 dark:text-purple-400 ring-1 ring-purple-500'
                    : 'bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-600'
                }`}
              >
                <ShoppingBag size={16} />
                {t('expense.categories.other')}
              </button>
            </div>
          </div>

          <div>
            <div className="flex gap-4 mb-4">
              <button
                type="button"
                onClick={() => setSplitType('EQUAL')}
                className={`flex-1 py-2 rounded-lg text-sm font-medium border transition-all ${splitType === 'EQUAL' ? 'bg-blue-50 dark:bg-blue-900/30 border-blue-600 text-blue-700 dark:text-blue-400 ring-1 ring-blue-600' : 'bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-600'}`}
              >
                {t('expense.equalSplit')}
              </button>
              <button
                type="button"
                onClick={() => setSplitType('CUSTOM')}
                className={`flex-1 py-2 rounded-lg text-sm font-medium border transition-all ${splitType === 'CUSTOM' ? 'bg-blue-50 dark:bg-blue-900/30 border-blue-600 text-blue-700 dark:text-blue-400 ring-1 ring-blue-600' : 'bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-600'}`}
              >
                {t('expense.exactSplit')}
              </button>
            </div>

            <div className="flex justify-between items-center mb-3">
              <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">{t('expense.forWhom')}</label>
              <button type="button" onClick={toggleAll} className="text-xs font-medium text-blue-600 dark:text-blue-400 hover:underline">
                {selectedUsers.size === users.length ? t('expense.deselectAll') : t('expense.selectAll')}
              </button>
            </div>
            <div className="flex flex-wrap gap-2">
              {users.map(u => {
                const isSelected = selectedUsers.has(u.id);
                return (
                  <button
                    key={u.id}
                    type="button"
                    onClick={() => toggleUser(u.id)}
                    className={`px-4 py-2 rounded-lg text-sm font-medium border transition-all flex items-center gap-1.5 ${
                      isSelected 
                        ? 'bg-blue-600 border-blue-600 text-white shadow-sm' 
                        : 'bg-white dark:bg-gray-700 border-dashed border-gray-300 dark:border-gray-600 text-gray-500 dark:text-gray-400 opacity-70 hover:opacity-100 hover:border-gray-400 dark:hover:border-gray-500'
                    }`}
                  >
                    {isSelected && <Check size={16} strokeWidth={3} />}
                    {u.name}
                  </button>
                );
              })}
            </div>

            {splitType === 'CUSTOM' && selectedUsers.size > 0 && (
              <div className="mt-5 space-y-3 border-t border-gray-100 dark:border-gray-700 pt-5 transition-colors">
                <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-3">{t('expense.exactAmounts')}</label>
                {Array.from(selectedUsers).map((userId: string) => (
                  <div key={userId} className="flex items-center justify-between gap-4">
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">{users.find(u => u.id === userId)?.name}</span>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 dark:text-gray-400 font-medium">€</span>
                      <input
                        type="number"
                        step="0.01"
                        min="0"
                        value={customAmounts[userId] || ''}
                        onChange={(e) => setCustomAmounts(prev => ({ ...prev, [userId]: e.target.value }))}
                        className="w-28 pl-8 pr-3 py-1.5 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors"
                        placeholder="0.00"
                        required
                      />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="flex gap-3 pt-4 border-t border-gray-100 dark:border-gray-700 shrink-0 transition-colors">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 px-4 py-3 rounded-lg font-bold hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
            >
              {t('expense.cancel')}
            </button>
            <button
              type="submit"
              disabled={!title || !amount || !payerId || selectedUsers.size === 0}
              className="flex-1 bg-blue-600 text-white px-4 py-3 rounded-lg font-bold hover:bg-blue-700 disabled:bg-gray-200 dark:disabled:bg-gray-700 disabled:text-gray-400 dark:disabled:text-gray-500 disabled:cursor-not-allowed transition-all"
            >
              {t('expense.saveChanges')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
