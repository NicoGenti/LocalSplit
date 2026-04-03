import React, { useState } from 'react';
import { useGroupStore } from '../store/useGroupStore';
import { SplitType, Split, ExpenseCategory } from '../types';
import { Receipt, Check, Utensils, Bus, ShoppingBag } from 'lucide-react';
import { toast } from 'react-hot-toast';

interface AddExpenseProps {
  onSuccess?: () => void;
  asModal?: boolean;
}

export function AddExpense({ onSuccess, asModal }: AddExpenseProps = {}) {
  const { users, addExpense } = useGroupStore();
  const [title, setTitle] = useState('');
  const [amount, setAmount] = useState('');
  const [payerId, setPayerId] = useState('');
  const [category, setCategory] = useState<ExpenseCategory | undefined>(undefined);
  const [splitType, setSplitType] = useState<SplitType>('EQUAL');
  const [selectedUsers, setSelectedUsers] = useState<Set<string>>(new Set());
  const [customAmounts, setCustomAmounts] = useState<Record<string, string>>({});

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
        toast.error(`La somma delle quote personalizzate (€${sum.toFixed(2)}) non corrisponde al totale (€${numAmount.toFixed(2)}).`);
        return;
      }
    }

    addExpense({
      title,
      amount: numAmount,
      payerId,
      category,
      splitType,
      splits
    });

    toast.success('Spesa aggiunta con successo!');

    setTitle('');
    setAmount('');
    setPayerId('');
    setCategory(undefined);
    setSelectedUsers(new Set());
    setCustomAmounts({});
    setSplitType('EQUAL');
    onSuccess?.();
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

  if (users.length === 0) {
    if (asModal) {
      return (
        <p className="text-sm text-gray-500 dark:text-gray-400 text-center py-8">
          Aggiungi partecipanti nella tab <span className="font-semibold">Gruppo</span> prima di inserire una spesa.
        </p>
      );
    }
    return null;
  }

  const formContent = (
    <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">Titolo</label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Es. Cena pizzeria"
            maxLength={100}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors"
            required
          />
        </div>

        <div className="flex gap-4">
          <div className="flex-1">
            <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">Importo (€)</label>
            <input
              type="number"
              step="0.01"
              min="0.01"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="0.00"
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors"
              required
            />
          </div>
          <div className="flex-1">
            <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">Pagato da</label>
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
          <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">Categoria (Opzionale)</label>
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
              Cibo
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
              Trasporti
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
              Altro
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
              In parti uguali
            </button>
            <button
              type="button"
              onClick={() => setSplitType('CUSTOM')}
              className={`flex-1 py-2 rounded-lg text-sm font-medium border transition-all ${splitType === 'CUSTOM' ? 'bg-blue-50 dark:bg-blue-900/30 border-blue-600 text-blue-700 dark:text-blue-400 ring-1 ring-blue-600' : 'bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-600'}`}
            >
              Quote esatte
            </button>
          </div>

          <div className="flex justify-between items-center mb-3">
            <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Per chi?</label>
            <button type="button" onClick={toggleAll} className="text-xs font-medium text-blue-600 dark:text-blue-400 hover:underline">
              {selectedUsers.size === users.length ? 'Deseleziona tutti' : 'Seleziona tutti'}
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
            <div className="mt-5 space-y-3 border-t border-gray-100 dark:border-gray-700 pt-5">
              <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-3">Inserisci le quote esatte:</label>
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

        <button
          type="submit"
          disabled={!title || !amount || !payerId || selectedUsers.size === 0}
          className="w-full bg-green-600 text-white px-4 py-3 rounded-lg font-bold hover:bg-green-700 disabled:bg-gray-200 dark:disabled:bg-gray-700 disabled:text-gray-400 dark:disabled:text-gray-500 disabled:cursor-not-allowed mt-6 transition-all"
        >
          Salva Spesa
        </button>
      </form>
  );

  if (asModal) {
    return formContent;
  }

  return (
    <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 transition-colors duration-200">
      <h2 className="text-xl font-semibold mb-4 text-gray-800 dark:text-white flex items-center gap-2">
        <Receipt size={20} />
        Aggiungi Spesa
      </h2>
      {formContent}
    </div>
  );
}
