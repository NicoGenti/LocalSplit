import React, { useMemo, useState, useRef, useEffect } from 'react';
import { useGroupStore } from '../store/useGroupStore';
import { calculateBalances, simplifyDebts } from '../lib/algorithm';
import { ArrowRight, Wallet, TrendingUp, TrendingDown, CheckCircle2, Info, X, Search, ChevronLeft, ChevronRight } from 'lucide-react';
import { Debt } from '../types';
import { toast } from 'react-hot-toast';
import { useTranslation } from '../i18n/index';
import { ConfirmDeleteModal } from './ConfirmDeleteModal';

const PAGE_SIZE = 5;

const Avatar = ({ name, className }: { name: string, className?: string }) => (
  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white font-bold text-sm uppercase shrink-0 ${className}`}>
    {name.charAt(0)}
  </div>
);

function Pagination({ page, totalPages, onPrev, onNext, prevLabel, nextLabel }: {
  page: number; totalPages: number; onPrev: () => void; onNext: () => void;
  prevLabel: string; nextLabel: string;
}) {
  if (totalPages <= 1) return null;
  return (
    <div className="flex items-center justify-between mt-3 pt-3 border-t border-gray-100 dark:border-gray-700">
      <button
        onClick={onPrev}
        disabled={page === 0}
        className="flex items-center gap-1 px-2 py-1 text-sm text-gray-600 dark:text-gray-400 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
      >
        <ChevronLeft size={16} />
        {prevLabel}
      </button>
      <span className="text-xs text-gray-500 dark:text-gray-400">
        {page + 1} / {totalPages}
      </span>
      <button
        onClick={onNext}
        disabled={page === totalPages - 1}
        className="flex items-center gap-1 px-2 py-1 text-sm text-gray-600 dark:text-gray-400 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
      >
        {nextLabel}
        <ChevronRight size={16} />
      </button>
    </div>
  );
}

function SearchInput({ value, onChange, placeholder }: {
  value: string; onChange: (v: string) => void; placeholder: string;
}) {
  return (
    <div className="relative mb-3">
      <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-500 pointer-events-none" />
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full pl-8 pr-3 py-1.5 text-sm border border-gray-200 dark:border-gray-600 dark:bg-gray-700/50 dark:text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors"
      />
    </div>
  );
}

export function Balances() {
  const { users, expenses, addExpense } = useGroupStore();
  const { t } = useTranslation();
  const [showInfo, setShowInfo] = useState(false);
  const [settlingDebt, setSettlingDebt] = useState<Debt | null>(null);
  const infoRef = useRef<HTMLDivElement>(null);

  // Search + pagination state for each section
  const [debtsSearch, setDebtsSearch] = useState('');
  const [debtsPage, setDebtsPage] = useState(0);
  const [creditorsSearch, setCreditorsSearch] = useState('');
  const [creditorsPage, setCreditorsPage] = useState(0);
  const [debtorsSearch, setDebtorsSearch] = useState('');
  const [debtorsPage, setDebtorsPage] = useState(0);

  useEffect(() => {
    if (!showInfo) return;
    const handleClickOutside = (e: MouseEvent) => {
      if (infoRef.current && !infoRef.current.contains(e.target as Node)) {
        setShowInfo(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showInfo]);

  const userMap = useMemo(() => new Map(users.map(u => [u.id, u.name])), [users]);
  const getUserName = (id: string) => userMap.get(id) ?? t('balances.unknown');

  const { balances, debts, creditors, debtors } = useMemo(() => {
    const bals = calculateBalances(expenses, users);
    const simplifiedDebts = simplifyDebts(bals);
    const creds = (Object.entries(bals) as [string, number][])
      .filter(([_, bal]) => bal > 0.01)
      .sort((a, b) => b[1] - a[1]);
    const dbtrs = (Object.entries(bals) as [string, number][])
      .filter(([_, bal]) => bal < -0.01)
      .sort((a, b) => a[1] - b[1]);
    return { balances: bals, debts: simplifiedDebts, creditors: creds, debtors: dbtrs };
  }, [expenses, users]);

  const handleSettle = (debt: Debt) => {
    setSettlingDebt(debt);
  };

  const confirmSettle = () => {
    if (!settlingDebt) return;
    addExpense({
      title: t('balances.settleExpenseTitle'),
      amount: settlingDebt.exactAmount,
      payerId: settlingDebt.from,
      splitType: 'CUSTOM',
      splits: [{ userId: settlingDebt.to, amount: settlingDebt.exactAmount }]
    });
    toast.success(t('balances.settleSuccess'));
    setSettlingDebt(null);
  };

  // Filtered + paginated debts
  const filteredDebts = debts.filter(d =>
    getUserName(d.from).toLowerCase().includes(debtsSearch.toLowerCase()) ||
    getUserName(d.to).toLowerCase().includes(debtsSearch.toLowerCase())
  );
  const debtsTotalPages = Math.max(1, Math.ceil(filteredDebts.length / PAGE_SIZE));
  const safeDebtsPage = Math.min(debtsPage, debtsTotalPages - 1);
  const paginatedDebts = filteredDebts.slice(safeDebtsPage * PAGE_SIZE, (safeDebtsPage + 1) * PAGE_SIZE);

  // Filtered + paginated creditors
  const filteredCreditors = creditors.filter(([userId]) =>
    getUserName(userId).toLowerCase().includes(creditorsSearch.toLowerCase())
  );
  const creditorsTotalPages = Math.max(1, Math.ceil(filteredCreditors.length / PAGE_SIZE));
  const safeCreditorsPage = Math.min(creditorsPage, creditorsTotalPages - 1);
  const paginatedCreditors = filteredCreditors.slice(safeCreditorsPage * PAGE_SIZE, (safeCreditorsPage + 1) * PAGE_SIZE);

  // Filtered + paginated debtors
  const filteredDebtors = debtors.filter(([userId]) =>
    getUserName(userId).toLowerCase().includes(debtorsSearch.toLowerCase())
  );
  const debtorsTotalPages = Math.max(1, Math.ceil(filteredDebtors.length / PAGE_SIZE));
  const safeDebtorsPage = Math.min(debtorsPage, debtorsTotalPages - 1);
  const paginatedDebtors = filteredDebtors.slice(safeDebtorsPage * PAGE_SIZE, (safeDebtorsPage + 1) * PAGE_SIZE);

  if (users.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center px-4">
        <div className="w-16 h-16 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center mb-4">
          <Wallet size={28} className="text-gray-400 dark:text-gray-500" />
        </div>
        <p className="text-gray-500 dark:text-gray-400 text-sm">
          {t('balances.emptyNoUsers')}
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
          {t('balances.emptyNoExpenses')}
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 transition-colors duration-200">
      <div className="relative flex items-center gap-2 mb-4" ref={infoRef}>
        <h2 className="text-xl font-semibold text-gray-800 dark:text-white flex items-center gap-2">
          <Wallet size={20} />
          {t('balances.title')}
        </h2>
        <button
          onClick={() => setShowInfo(v => !v)}
          className="text-gray-400 hover:text-blue-500 dark:text-gray-500 dark:hover:text-blue-400 transition-colors flex-shrink-0"
          aria-label={t('balances.algorithmInfo')}
        >
          <Info size={18} />
        </button>

        {showInfo && (
          <div className="absolute z-20 top-full mt-2 left-0 w-80 bg-white dark:bg-gray-800 border border-blue-100 dark:border-blue-900 rounded-xl shadow-lg p-4 text-sm text-gray-700 dark:text-gray-300">
            <div className="flex items-start justify-between gap-2 mb-3">
              <span className="font-semibold text-blue-600 dark:text-blue-400 flex items-center gap-1.5">
                <Info size={15} />
                {t('balances.algorithmInfo')}
              </span>
              <button onClick={() => setShowInfo(false)} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors">
                <X size={15} />
              </button>
            </div>
            <ol className="space-y-2 list-none">
              <li className="flex gap-2">
                <span className="flex-shrink-0 w-5 h-5 rounded-full bg-blue-100 dark:bg-blue-900/40 text-blue-600 dark:text-blue-400 text-xs font-bold flex items-center justify-center">1</span>
                <span>{t('balances.algoStep1')}</span>
              </li>
              <li className="flex gap-2">
                <span className="flex-shrink-0 w-5 h-5 rounded-full bg-blue-100 dark:bg-blue-900/40 text-blue-600 dark:text-blue-400 text-xs font-bold flex items-center justify-center">2</span>
                <span>{t('balances.algoStep2')}</span>
              </li>
              <li className="flex gap-2">
                <span className="flex-shrink-0 w-5 h-5 rounded-full bg-blue-100 dark:bg-blue-900/40 text-blue-600 dark:text-blue-400 text-xs font-bold flex items-center justify-center">3</span>
                <span>{t('balances.algoStep3')}</span>
              </li>
              <li className="flex gap-2">
                <span className="flex-shrink-0 w-5 h-5 rounded-full bg-blue-100 dark:bg-blue-900/40 text-blue-600 dark:text-blue-400 text-xs font-bold flex items-center justify-center">4</span>
                <span>{t('balances.algoStep4')}</span>
              </li>
            </ol>
            <p className="mt-3 text-xs text-gray-400 dark:text-gray-500">{t('balances.algoNote')}</p>
          </div>
        )}
      </div>

      {debts.length === 0 ? (
        <div className="text-center py-8 text-gray-500 dark:text-gray-400">
          <p>{t('balances.allSettled')}</p>
        </div>
      ) : (
        <>
          <SearchInput
            value={debtsSearch}
            onChange={(q) => { setDebtsSearch(q); setDebtsPage(0); }}
            placeholder={t('balances.searchPlaceholder')}
          />
          <div className="space-y-4">
            {paginatedDebts.map((debt) => (
              <div key={`${debt.from}-${debt.to}`} className="p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg border border-gray-100 dark:border-gray-600 transition-colors">
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
                    {t('balances.settle')}
                  </button>
                </div>
              </div>
            ))}
            {filteredDebts.length === 0 && (
              <p className="text-center text-sm text-gray-500 dark:text-gray-400 py-4">
                {t('balances.noResults', { query: debtsSearch })}
              </p>
            )}
          </div>
          <Pagination
            page={safeDebtsPage}
            totalPages={debtsTotalPages}
            onPrev={() => setDebtsPage(p => Math.max(0, p - 1))}
            onNext={() => setDebtsPage(p => Math.min(debtsTotalPages - 1, p + 1))}
            prevLabel={t('pagination.prev')}
            nextLabel={t('pagination.next')}
          />
        </>
      )}

      {(creditors.length > 0 || debtors.length > 0) && (
        <div className="mt-8 pt-6 border-t border-gray-100 dark:border-gray-700">
          <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-4">{t('balances.netBalances')}</h3>

          <div className="space-y-6">
            {creditors.length > 0 && (
              <div>
                <h4 className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-3 flex items-center gap-2">
                  <TrendingUp size={16} className="text-green-500" />
                  {t('balances.toReceive')}
                </h4>
                <SearchInput
                  value={creditorsSearch}
                  onChange={(q) => { setCreditorsSearch(q); setCreditorsPage(0); }}
                  placeholder={t('balances.searchPlaceholder')}
                />
                <div className="space-y-2">
                  {paginatedCreditors.map(([userId, balance]) => (
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
                  {filteredCreditors.length === 0 && (
                    <p className="text-center text-sm text-gray-500 dark:text-gray-400 py-2">
                      {t('balances.noResults', { query: creditorsSearch })}
                    </p>
                  )}
                </div>
                <Pagination
                  page={safeCreditorsPage}
                  totalPages={creditorsTotalPages}
                  onPrev={() => setCreditorsPage(p => Math.max(0, p - 1))}
                  onNext={() => setCreditorsPage(p => Math.min(creditorsTotalPages - 1, p + 1))}
                  prevLabel={t('pagination.prev')}
                  nextLabel={t('pagination.next')}
                />
              </div>
            )}

            {debtors.length > 0 && (
              <div>
                <h4 className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-3 flex items-center gap-2">
                  <TrendingDown size={16} className="text-red-500" />
                  {t('balances.toPay')}
                </h4>
                <SearchInput
                  value={debtorsSearch}
                  onChange={(q) => { setDebtorsSearch(q); setDebtorsPage(0); }}
                  placeholder={t('balances.searchPlaceholder')}
                />
                <div className="space-y-2">
                  {paginatedDebtors.map(([userId, balance]) => (
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
                  {filteredDebtors.length === 0 && (
                    <p className="text-center text-sm text-gray-500 dark:text-gray-400 py-2">
                      {t('balances.noResults', { query: debtorsSearch })}
                    </p>
                  )}
                </div>
                <Pagination
                  page={safeDebtorsPage}
                  totalPages={debtorsTotalPages}
                  onPrev={() => setDebtorsPage(p => Math.max(0, p - 1))}
                  onNext={() => setDebtorsPage(p => Math.min(debtorsTotalPages - 1, p + 1))}
                  prevLabel={t('pagination.prev')}
                  nextLabel={t('pagination.next')}
                />
              </div>
            )}
          </div>
        </div>
      )}

      <ConfirmDeleteModal
        isOpen={settlingDebt !== null}
        onConfirm={confirmSettle}
        onCancel={() => setSettlingDebt(null)}
        message={settlingDebt ? t('balances.settleConfirm', {
          from: getUserName(settlingDebt.from),
          amount: settlingDebt.amount.toFixed(2),
          to: getUserName(settlingDebt.to),
        }) : undefined}
        confirmLabel={t('balances.settle')}
        variant="confirm"
      />
    </div>
  );
}
