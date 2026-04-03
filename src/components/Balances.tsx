import React, { useMemo } from 'react';
import { useGroupStore } from '../store/useGroupStore';
import { calculateBalances, simplifyDebts } from '../lib/algorithm';
import { ArrowRight, Wallet, TrendingUp, TrendingDown, CheckCircle2 } from 'lucide-react';
import { Debt } from '../types';
import { toast } from 'react-hot-toast';

const Avatar = ({ name, className }: { name: string, className?: string }) => (
  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white font-bold text-sm uppercase shrink-0 ${className}`}>
    {name.charAt(0)}
  </div>
);

export function Balances() {
  const { users, expenses, addExpense } = useGroupStore();

  const { balances, debts } = useMemo(() => {
    const bals = calculateBalances(expenses, users);
    const simplifiedDebts = simplifyDebts(bals);
    return { balances: bals, debts: simplifiedDebts };
  }, [expenses, users]);

  const getUserName = (id: string) => users.find(u => u.id === id)?.name || 'Sconosciuto';

  const handleSettle = (debt: Debt) => {
    if (window.confirm(`Confermi che ${getUserName(debt.from)} ha pagato €${debt.amount.toFixed(2)} a ${getUserName(debt.to)}?`)) {
      addExpense({
        title: 'Saldo debito',
        amount: debt.exactAmount,
        payerId: debt.from,
        splitType: 'CUSTOM',
        splits: [{ userId: debt.to, amount: debt.exactAmount }]
      });
      toast.success('Debito saldato con successo!');
    }
  };

  if (users.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center px-4">
        <div className="w-16 h-16 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center mb-4">
          <Wallet size={28} className="text-gray-400 dark:text-gray-500" />
        </div>
        <p className="text-gray-500 dark:text-gray-400 text-sm">
          Aggiungi partecipanti nella tab <span className="font-semibold">Gruppo</span> per iniziare
        </p>
      </div>
    );
  }

  if (expenses.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center px-4">
        <div className="w-16 h-16 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center mb-4">
          <Wallet size={28} className="text-gray-400 dark:text-gray-500" />
        </div>
        <p className="text-gray-500 dark:text-gray-400 text-sm">
          Aggiungi una spesa nella tab <span className="font-semibold">Spese</span> per vedere i saldi
        </p>
      </div>
    );
  }

  const creditors = (Object.entries(balances) as [string, number][])
    .filter(([_, bal]) => bal > 0.01)
    .sort((a, b) => b[1] - a[1]);
    
  const debtors = (Object.entries(balances) as [string, number][])
    .filter(([_, bal]) => bal < -0.01)
    .sort((a, b) => a[1] - b[1]);

  return (
    <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 transition-colors duration-200">
      <h2 className="text-xl font-semibold mb-6 text-gray-800 dark:text-white flex items-center gap-2">
        <Wallet size={20} />
        Chi deve a chi
      </h2>

      {debts.length === 0 ? (
        <div className="text-center py-8 text-gray-500 dark:text-gray-400">
          <p>Tutti i conti sono in pari! 🎉</p>
        </div>
      ) : (
        <div className="space-y-4">
          {debts.map((debt, idx) => (
            <div key={idx} className="p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg border border-gray-100 dark:border-gray-600 transition-colors">
              {/* Riga 1: da → a */}
              <div className="flex items-center gap-2 flex-wrap min-w-0 mb-3">
                <div className="flex items-center gap-2 min-w-0 flex-1">
                  <Avatar name={getUserName(debt.from)} className="bg-red-500 shrink-0" />
                  <span className="font-medium text-gray-800 dark:text-gray-200 truncate" title={getUserName(debt.from)}>
                    {getUserName(debt.from)}
                  </span>
                </div>
                <ArrowRight size={16} className="text-gray-400 dark:text-gray-500 shrink-0" />
                <div className="flex items-center gap-2 min-w-0 flex-1">
                  <Avatar name={getUserName(debt.to)} className="bg-green-500 shrink-0" />
                  <span className="font-medium text-gray-800 dark:text-gray-200 truncate" title={getUserName(debt.to)}>
                    {getUserName(debt.to)}
                  </span>
                </div>
              </div>
              {/* Riga 2: importo + bottone Salda */}
              <div className="flex items-center justify-between">
                <span className="font-bold text-gray-800 dark:text-white text-lg">
                  €{debt.amount.toFixed(2)}
                </span>
                <button
                  onClick={() => handleSettle(debt)}
                  className="flex items-center gap-1.5 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 px-3 py-1.5 rounded-lg font-medium hover:bg-green-200 dark:hover:bg-green-900/50 transition-colors text-sm"
                >
                  <CheckCircle2 size={16} />
                  Salda
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {(creditors.length > 0 || debtors.length > 0) && (
        <div className="mt-8 pt-6 border-t border-gray-100 dark:border-gray-700">
          <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-4">Saldi Netti</h3>
          
          <div className="space-y-6">
            {creditors.length > 0 && (
              <div>
                <h4 className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-3 flex items-center gap-2">
                  <TrendingUp size={16} className="text-green-500" />
                  Chi deve ricevere
                </h4>
                <div className="space-y-2">
                  {creditors.map(([userId, balance]) => (
                    <div key={userId} className="flex justify-between items-center p-3 bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 rounded-lg shadow-sm transition-colors">
                      <div className="flex items-center gap-2 min-w-0 flex-1">
                        <Avatar name={getUserName(userId)} className="bg-green-500 w-6 h-6 text-xs shrink-0" />
                        <span className="font-medium text-gray-700 dark:text-gray-300 truncate">{getUserName(userId)}</span>
                      </div>
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-sm font-semibold whitespace-nowrap bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400 border border-green-200 dark:border-green-800 shrink-0">
                        +{balance.toFixed(2)} €
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {debtors.length > 0 && (
              <div>
                <h4 className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-3 flex items-center gap-2">
                  <TrendingDown size={16} className="text-red-500" />
                  Chi deve pagare
                </h4>
                <div className="space-y-2">
                  {debtors.map(([userId, balance]) => (
                    <div key={userId} className="flex justify-between items-center p-3 bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 rounded-lg shadow-sm transition-colors">
                      <div className="flex items-center gap-2 min-w-0 flex-1">
                        <Avatar name={getUserName(userId)} className="bg-red-500 w-6 h-6 text-xs shrink-0" />
                        <span className="font-medium text-gray-700 dark:text-gray-300 truncate">{getUserName(userId)}</span>
                      </div>
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-sm font-semibold whitespace-nowrap bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400 border border-red-200 dark:border-red-800 shrink-0">
                        {balance.toFixed(2)} €
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
