import React, { useState, useEffect } from 'react';
import { useGroupStore } from './store/useGroupStore';
import { Participants } from './components/Participants';
import { AddExpense } from './components/AddExpense';
import { Balances } from './components/Balances';
import { ExpenseList } from './components/ExpenseList';
import { Edit2, Check, Moon, Sun } from 'lucide-react';
import { Toaster, toast } from 'react-hot-toast';

export default function App() {
  const store = useGroupStore();
  const [isEditingName, setIsEditingName] = useState(false);
  const [tempName, setTempName] = useState(store.name);
  const [isDarkMode, setIsDarkMode] = useState(() => {
    if (typeof window !== 'undefined') {
      return document.documentElement.classList.contains('dark') || 
             window.matchMedia('(prefers-color-scheme: dark)').matches;
    }
    return false;
  });

  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDarkMode]);

  const handleNameSave = () => {
    if (tempName.trim() && tempName.trim() !== store.name) {
      store.setName(tempName.trim());
      toast.success('Nome del gruppo aggiornato');
    }
    setIsEditingName(false);
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-100 font-sans transition-colors duration-200">
      <Toaster 
        position="top-center" 
        toastOptions={{ 
          duration: 3000,
          style: isDarkMode ? {
            background: '#374151',
            color: '#fff',
          } : undefined
        }} 
      />
      <header className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 sticky top-0 z-10 transition-colors duration-200">
        <div className="max-w-5xl mx-auto px-4 py-4 flex flex-col sm:flex-row justify-between items-center gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center text-white font-bold text-xl shadow-sm uppercase">
              {store.name ? store.name.charAt(0) : '?'}
            </div>
            {isEditingName ? (
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={tempName}
                  onChange={(e) => setTempName(e.target.value)}
                  className="px-2 py-1 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded text-xl font-bold focus:outline-none focus:ring-2 focus:ring-blue-500"
                  autoFocus
                  onKeyDown={(e) => e.key === 'Enter' && handleNameSave()}
                />
                <button onClick={handleNameSave} className="text-green-600 dark:text-green-400 p-1 hover:bg-green-50 dark:hover:bg-green-900/30 rounded">
                  <Check size={20} />
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-2 group">
                <h1 className="text-xl font-bold text-gray-800 dark:text-white">{store.name}</h1>
                <button 
                  onClick={() => { setTempName(store.name); setIsEditingName(true); }}
                  className="text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity p-1 hover:text-blue-600 dark:hover:text-blue-400"
                >
                  <Edit2 size={16} />
                </button>
              </div>
            )}
          </div>
          
          <div className="flex items-center gap-4">
            <button
              onClick={() => setIsDarkMode(!isDarkMode)}
              className="relative inline-flex h-7 w-14 items-center rounded-full bg-gray-200 dark:bg-gray-700 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:focus:ring-offset-gray-900"
              aria-label="Toggle dark mode"
            >
              <span
                className={`${
                  isDarkMode ? 'translate-x-8' : 'translate-x-1'
                } inline-block h-5 w-5 transform rounded-full bg-white transition-transform flex items-center justify-center shadow-sm`}
              >
                {isDarkMode ? <Moon size={12} className="text-gray-800" /> : <Sun size={12} className="text-yellow-500" />}
              </span>
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
          {/* Left Column */}
          <div className="md:col-span-5 space-y-6">
            <Participants />
            <AddExpense />
          </div>

          {/* Right Column */}
          <div className="md:col-span-7 space-y-6">
            <Balances />
            <ExpenseList />
          </div>
        </div>
      </main>
    </div>
  );
}
