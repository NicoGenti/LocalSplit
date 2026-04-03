import React, { useState, useEffect } from 'react';
import { useGroupStore } from '../store/useGroupStore';
import { History, Utensils, Bus, ShoppingBag, Receipt, MoreVertical, Edit2, Trash2 } from 'lucide-react';
import { EditExpenseModal } from './EditExpenseModal';
import { ConfirmDeleteModal } from './ConfirmDeleteModal';
import { Expense } from '../types';
import { toast } from 'react-hot-toast';

export function ExpenseList() {
  const { expenses, users, removeExpense } = useGroupStore();
  const [editingExpenseId, setEditingExpenseId] = useState<string | null>(null);
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);
  const [deletingExpenseId, setDeletingExpenseId] = useState<string | null>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (!target.closest('[data-menu-id]')) {
        setOpenMenuId(null);
      }
    };
    if (openMenuId) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [openMenuId]);

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
    <div className="bg-white dark:bg-gray-800 p-4 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 transition-colors duration-200">
      <h2 className="text-xl font-semibold mb-6 text-gray-800 dark:text-white flex items-center gap-2">
        <History size={20} />
        Storico Spese
      </h2>

      <div className="space-y-4">
        {Object.entries(groupedExpenses).map(([dateStr, dayExpenses]) => (
          <div key={dateStr}>
            <h3 className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-3 pl-1">{dateStr}</h3>
            <div className="space-y-2">
              {dayExpenses.map(expense => (
                <div key={expense.id} className="relative p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg border border-gray-100 dark:border-gray-600 hover:border-gray-200 dark:hover:border-gray-500 transition-colors">
                  {/* Riga 1: titolo + badge + importo + menu */}
                  <div className="flex items-center gap-2 min-w-0">
                    <h4 className="font-medium text-gray-800 dark:text-gray-200 truncate">{expense.title}</h4>
                    {expense.category && (
                      <span className={`flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold border uppercase tracking-wider shrink-0 ${getCategoryBadgeClass(expense.category)}`}>
                        {getCategoryIcon(expense.category)}
                        {expense.category}
                      </span>
                    )}
                    <span className="ml-auto font-bold text-gray-800 dark:text-white text-base shrink-0">€{expense.amount.toFixed(2)}</span>
                    {/* Menu contestuale */}
                    <div className="relative shrink-0" data-menu-id={expense.id}>
                      <button
                        onClick={() => setOpenMenuId(openMenuId === expense.id ? null : expense.id)}
                        className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 p-1 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                        aria-label="Azioni spesa"
                      >
                        <MoreVertical size={18} />
                      </button>
                      {openMenuId === expense.id && (
                        <div className="absolute right-0 top-7 z-30 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded-xl shadow-lg py-1 min-w-[140px]">
                          <button
                            onClick={() => { setEditingExpenseId(expense.id); setOpenMenuId(null); }}
                            className="w-full flex items-center gap-2 px-4 py-2.5 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                          >
                            <Edit2 size={15} />
                            Modifica
                          </button>
                          <button
                            onClick={() => { setDeletingExpenseId(expense.id); setOpenMenuId(null); }}
                            className="w-full flex items-center gap-2 px-4 py-2.5 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                          >
                            <Trash2 size={15} />
                            Elimina
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                  {/* Riga 2: pagato da + per chi */}
                  <div className="flex items-center gap-1.5 mt-1 text-xs text-gray-500 dark:text-gray-400 min-w-0">
                    <span className="shrink-0">Pagato da</span>
                    <span className="font-medium text-gray-700 dark:text-gray-300 truncate min-w-0 flex-1">{getUserName(expense.payerId)}</span>
                    <span className="shrink-0">•</span>
                    <span className="shrink-0">Per:</span>
                    <div className="flex -space-x-1.5 shrink-0">
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
      <ConfirmDeleteModal
        isOpen={deletingExpenseId !== null}
        onConfirm={() => {
          if (deletingExpenseId) {
            handleRemove(deletingExpenseId);
            setDeletingExpenseId(null);
          }
        }}
        onCancel={() => setDeletingExpenseId(null)}
      />
    </div>
  );
}
