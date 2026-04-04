import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useGroupStore } from './store/useGroupStore';
import { Participants } from './components/Participants';
import { Balances } from './components/Balances';
import { ExpenseList } from './components/ExpenseList';
import { AddExpenseModal } from './components/AddExpenseModal';
import { LandingPage } from './components/LandingPage';
import { Edit2, Check, Moon, Sun, Wallet, Receipt, Users, Plus } from 'lucide-react';
import { Toaster, toast } from 'react-hot-toast';
import { useTranslation } from './i18n/index';

type Tab = 'summary' | 'expenses' | 'group';

const DARK_TOAST_STYLE = { background: '#374151', color: '#fff' };

export default function App() {
  const store = useGroupStore();
  const { t, language, setLanguage } = useTranslation();
  const [activeTab, setActiveTab] = useState<Tab>('summary');
  const [isAddExpenseOpen, setIsAddExpenseOpen] = useState(false);
  const [isEditingName, setIsEditingName] = useState(false);
  const [tempName, setTempName] = useState(store.name);
  const [isDarkMode, setIsDarkMode] = useState(() => {
    if (typeof window !== 'undefined') {
      return document.documentElement.classList.contains('dark') ||
        window.matchMedia('(prefers-color-scheme: dark)').matches;
    }
    return false;
  });
  const [view, setView] = useState<'landing' | 'app'>('landing');

  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDarkMode]);

  const totalExpenses = useMemo(
    () => store.expenses.reduce((sum, e) => sum + e.amount, 0),
    [store.expenses]
  );

  const handleNameSave = () => {
    if (tempName.trim() && tempName.trim() !== store.name) {
      store.setName(tempName.trim());
      toast.success(t('header.groupNameUpdated'));
    }
    setIsEditingName(false);
  };

  const handleCloseModal = useCallback(() => setIsAddExpenseOpen(false), []);

  const TABS: { id: Tab; labelKey: string; icon: React.ReactNode }[] = [
    { id: 'summary',  labelKey: 'tabs.summary',  icon: <Wallet size={22} /> },
    { id: 'expenses', labelKey: 'tabs.expenses', icon: <Receipt size={22} /> },
    { id: 'group',    labelKey: 'tabs.group',    icon: <Users size={22} /> },
  ];

  if (view === 'landing') {
    return (
      <LandingPage
        isDarkMode={isDarkMode}
        onToggleDarkMode={() => setIsDarkMode(d => !d)}
        onEnterApp={() => setView('app')}
      />
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-100 font-sans transition-colors duration-200">
      <Toaster
        position="top-center"
        toastOptions={{
          duration: 3000,
          style: isDarkMode ? DARK_TOAST_STYLE : undefined,
        }}
      />

      {/* ── Header ── */}
      <header className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 sticky top-0 z-10 transition-colors duration-200">
        <div className="max-w-xl mx-auto px-4 py-3 flex items-center justify-between gap-3">

          {/* Left: group name */}
          <div className="flex items-center gap-2 min-w-0">
            {isEditingName ? (
              <div className="flex items-center gap-1.5 min-w-0">
                <input
                  type="text"
                  value={tempName}
                  onChange={(e) => setTempName(e.target.value)}
                  className="px-2 py-0.5 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded text-base font-bold focus:outline-none focus:ring-2 focus:ring-blue-500 min-w-0 w-36"
                  autoFocus
                  onKeyDown={(e) => e.key === 'Enter' && handleNameSave()}
                />
                <button
                  onClick={handleNameSave}
                  className="text-green-600 dark:text-green-400 p-1 hover:bg-green-50 dark:hover:bg-green-900/30 rounded shrink-0"
                >
                  <Check size={18} />
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-1.5 min-w-0 group">
                <h1 className="text-base font-bold text-gray-800 dark:text-white truncate">{store.name}</h1>
                <button
                  onClick={() => { setTempName(store.name); setIsEditingName(true); }}
                  className="text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity p-1 hover:text-blue-600 dark:hover:text-blue-400 shrink-0"
                >
                  <Edit2 size={14} />
                </button>
              </div>
            )}
          </div>

          {/* Right: total + language toggle + dark mode toggle */}
          <div className="flex items-center gap-3 shrink-0">
            <span className="text-sm font-semibold text-gray-600 dark:text-gray-300 whitespace-nowrap">
              {t('header.total')} <span className="text-gray-900 dark:text-white">€{totalExpenses.toFixed(2)}</span>
            </span>
            <button
              onClick={() => setLanguage(language === 'it' ? 'en' : 'it')}
              className="text-sm font-semibold text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors px-1"
              aria-label="Change language"
            >
              {language === 'it' ? 'EN' : 'IT'}
            </button>
            <button
              onClick={() => setIsDarkMode(!isDarkMode)}
              className="relative inline-flex h-6 w-11 items-center rounded-full bg-gray-200 dark:bg-gray-700 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:focus:ring-offset-gray-900"
              aria-label="Toggle dark mode"
            >
              <span
                className={`${isDarkMode ? 'translate-x-6' : 'translate-x-1'} inline-flex h-4 w-4 transform rounded-full bg-white transition-transform items-center justify-center shadow-sm`}
              >
                {isDarkMode
                  ? <Moon size={10} className="text-gray-800" />
                  : <Sun size={10} className="text-yellow-500" />}
              </span>
            </button>
          </div>
        </div>
      </header>

      {/* ── Main content ── */}
      <main className="max-w-xl mx-auto px-4 pt-6 pb-24">
        {activeTab === 'summary'  && <Balances />}
        {activeTab === 'expenses' && <ExpenseList />}
        {activeTab === 'group'    && <Participants />}
      </main>

      {/* ── FAB (hidden in group tab to avoid overlapping pagination) ── */}
      {activeTab !== 'group' && (
        <button
          onClick={() => setIsAddExpenseOpen(true)}
          className="fixed bottom-20 right-4 w-14 h-14 bg-blue-600 hover:bg-blue-700 text-white rounded-full shadow-lg flex items-center justify-center z-20 transition-colors"
          aria-label={t('header.addExpense')}
        >
          <Plus size={26} />
        </button>
      )}

      {/* ── Add Expense Modal ── */}
      <AddExpenseModal
        isOpen={isAddExpenseOpen}
        onClose={handleCloseModal}
      />

      {/* ── Bottom Navigation ── */}
      <nav className="fixed bottom-0 inset-x-0 bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 z-10 transition-colors duration-200">
        <div className="max-w-xl mx-auto flex">
          {TABS.map((tab) => {
            const isActive = activeTab === tab.id;
            const badgeCount = tab.id === 'expenses' ? store.expenses.length : tab.id === 'group' ? store.users.length : 0;
            const showBadge = badgeCount > 0;
            const badgeLabel = badgeCount > 99 ? '99+' : String(badgeCount);
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex-1 flex flex-col items-center justify-center gap-1 py-2.5 transition-colors border-t-2 ${
                  isActive
                    ? 'text-blue-600 dark:text-blue-400 border-blue-600 dark:border-blue-400 bg-blue-50/60 dark:bg-blue-900/20'
                    : 'text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300 border-transparent'
                }`}
                aria-label={t(tab.labelKey)}
              >
                <div className="relative">
                  <span className={`transition-transform duration-150 inline-flex ${isActive ? 'scale-110' : 'scale-100'}`}>
                    {tab.icon}
                  </span>
                  {showBadge && (
                    <span className="absolute -top-1.5 -right-2.5 min-w-[16px] h-4 px-1 bg-blue-600 dark:bg-blue-500 text-white text-[9px] font-bold rounded-full flex items-center justify-center leading-none">
                      {badgeLabel}
                    </span>
                  )}
                </div>
                <span className="text-[11px] font-medium">{t(tab.labelKey)}</span>
              </button>
            );
          })}
        </div>
      </nav>
    </div>
  );
}
