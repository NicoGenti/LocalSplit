import React, { useState } from 'react';
import { useGroupStore } from '../store/useGroupStore';
import { Trash2, History, Edit2, Utensils, Bus, ShoppingBag, Receipt } from 'lucide-react';
import { EditExpenseModal } from './EditExpenseModal';
import { Expense } from '../types';
import { toast } from 'react-hot-toast';

export function ExpenseList() {
  const { expenses, users, removeExpense } = useGroupStore();
  const [editingExpenseId, setEditingExpenseId] = useState<string | null>(null);

  const getUserName = (id: string) => users.find(u => u.id === id)?.name || 'Sconosciuto';

  const handleRemove = (id: string) => {
    removeExpense(id);
    toast.success('Spesa eliminata');
  };

  if (expenses.length === 0) {
    return (
      <div className="bg-white dark:bg-gray-800 p-12 rounded-xl shadow-sm border-2 border-dashed border-gray-200 dark:border-gray-700 flex flex-col items-center justify-center text-center transition-colors duration-200">
        <div className="w-16 h-16 bg-gray-50 dark:bg-gray-700 rounded-full flex items-center justify-center mb-4 transition-colors">
          <Receipt size={32} className="text-gray-400 dark:text-gray-500" />
        </div>
        <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-2">Nessuna spesa ancora</h3>
        <p className="text-gray-500 dark:text-gray-400 text-sm max-w-[250px]">
          Aggiungi la tua prima spesa per iniziare a dividere i conti con il gruppo!
        </p>
      </div>
    );
  }

  // Sort expenses by date descending
  const sortedExpenses = [...expenses].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  const groupedExpenses = sortedExpenses.reduce((acc, expense) => {
    const dateObj = new Date(expense.date);
    const today = new Date();
    const isToday = dateObj.getDate() === today.getDate() && 
                    dateObj.getMonth() === today.getMonth() && 
                    dateObj.getFullYear() === today.getFullYear();
    
    const dateStr = isToday 
      ? `Oggi — ${dateObj.toLocaleDateString('it-IT', { day: 'numeric', month: 'short', year: 'numeric' })}`
      : dateObj.toLocaleDateString('it-IT', { day: 'numeric', month: 'short', year: 'numeric' });

    if (!acc[dateStr]) {
      acc[dateStr] = [];
    }
    acc[dateStr].push(expense);
    return acc;
  }, {} as Record<string, Expense[]>);

  const editingExpense = expenses.find(e => e.id === editingExpenseId);

  const getCategoryIcon = (category?: string) => {
    switch (category) {
      case 'cibo': return <Utensils size={14} className="text-orange-600" />;
      case 'trasporti': return <Bus size={14} className="text-blue-600" />;
      case 'altro': return <ShoppingBag size={14} className="text-purple-600" />;
      default: return null;
    }
  };

  const getCategoryBadgeClass = (category?: string) => {
    switch (category) {
      case 'cibo': return 'bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-400 border-orange-200 dark:border-orange-800';
      case 'trasporti': return 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 border-blue-200 dark:border-blue-800';
      case 'altro': return 'bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-400 border-purple-200 dark:border-purple-800';
      default: return '';
    }
  };

  return (
    <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 transition-colors duration-200">
      <h2 className="text-xl font-semibold mb-6 text-gray-800 dark:text-white flex items-center gap-2">
        <History size={20} />
        Storico Spese
      </h2>

      <div className="space-y-6">
        {Object.entries(groupedExpenses).map(([dateStr, dayExpenses]) => (
          <div key={dateStr}>
            <h3 className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-3 pl-1">{dateStr}</h3>
            <div className="space-y-3">
              {dayExpenses.map(expense => (
                <div key={expense.id} className="flex justify-between items-center p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg border border-gray-100 dark:border-gray-600 hover:border-gray-200 dark:hover:border-gray-500 transition-colors">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h4 className="font-medium text-gray-800 dark:text-gray-200">{expense.title}</h4>
                      {expense.category && (
                        <span className={`flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold border uppercase tracking-wider ${getCategoryBadgeClass(expense.category)}`}>
                          {getCategoryIcon(expense.category)}
                          {expense.category}
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-3">
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        Pagato da <span className="font-medium text-gray-700 dark:text-gray-300">{getUserName(expense.payerId)}</span>
                      </p>
                      <div className="flex items-center gap-1.5 text-xs text-gray-400 dark:text-gray-500">
                        <span>•</span>
                        <span>Per:</span>
                        <div className="flex -space-x-1.5">
                          {expense.splits.map(split => (
                            <div 
                              key={split.userId} 
                              className="w-5 h-5 rounded-full bg-gray-200 dark:bg-gray-600 border border-white dark:border-gray-800 flex items-center justify-center text-[9px] font-bold text-gray-600 dark:text-gray-300 shadow-sm transition-colors" 
                              title={getUserName(split.userId)}
                            >
                              {getUserName(split.userId).charAt(0).toUpperCase()}
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 pl-4">
                    <span className="font-bold text-gray-800 dark:text-white text-lg">€{expense.amount.toFixed(2)}</span>
                    <div className="flex items-center gap-2 border-l border-gray-200 dark:border-gray-600 pl-3 transition-colors">
                      <button
                        onClick={() => setEditingExpenseId(expense.id)}
                        className="text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 p-2 rounded-lg hover:bg-blue-50 dark:hover:bg-blue-900/30 transition-colors"
                        title="Modifica spesa"
                      >
                        <Edit2 size={16} />
                      </button>
                      <button
                        onClick={() => handleRemove(expense.id)}
                        className="text-gray-400 hover:text-red-600 dark:hover:text-red-400 p-2 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/30 transition-colors"
                        title="Elimina spesa"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      {editingExpense && (
        <EditExpenseModal 
          expense={editingExpense} 
          onClose={() => setEditingExpenseId(null)} 
        />
      )}
    </div>
  );
}
