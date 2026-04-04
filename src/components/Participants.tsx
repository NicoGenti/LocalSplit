import React, { useState } from 'react';
import { useGroupStore } from '../store/useGroupStore';
import { UserPlus, Trash2, Search, ChevronLeft, ChevronRight } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { ConfirmDeleteModal } from './ConfirmDeleteModal';
import { useTranslation } from '../i18n/index';

const PAGE_SIZE = 5;

export function Participants() {
  const { users, addUser, removeUser } = useGroupStore();
  const { t } = useTranslation();
  const [newName, setNewName] = useState('');
  const [deletingUser, setDeletingUser] = useState<{ id: string; name: string } | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [page, setPage] = useState(0);

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (newName.trim()) {
      addUser(newName.trim());
      toast.success(t('participants.added', { name: newName.trim() }));
      setNewName('');
    }
  };

  const handleRemove = (id: string, name: string) => {
    removeUser(id);
    toast.success(t('participants.removed', { name }));
  };

  const filtered = users.filter(u =>
    u.name.toLowerCase().includes(searchQuery.toLowerCase())
  );
  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const safePage = Math.min(page, totalPages - 1);
  const paginated = filtered.slice(safePage * PAGE_SIZE, (safePage + 1) * PAGE_SIZE);

  const handleSearch = (q: string) => {
    setSearchQuery(q);
    setPage(0);
  };

  return (
    <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 transition-colors duration-200">
      <h2 className="text-xl font-semibold mb-4 text-gray-800 dark:text-white">{t('participants.title')}</h2>

      <form onSubmit={handleAdd} className="flex gap-2 mb-4">
        <input
          type="text"
          value={newName}
          onChange={(e) => setNewName(e.target.value)}
          placeholder={t('participants.placeholder')}
          maxLength={50}
          className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors"
        />
        <button
          type="submit"
          disabled={!newName.trim()}
          className="bg-blue-600 text-white px-3 sm:px-4 py-2.5 rounded-lg hover:bg-blue-700 disabled:opacity-50 flex items-center gap-2 transition-colors shrink-0"
          aria-label={t('participants.add')}
        >
          <UserPlus size={18} />
          <span className="hidden sm:inline">{t('participants.add')}</span>
        </button>
      </form>

      {users.length > 0 && (
        <div className="relative mb-3">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-500 pointer-events-none" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => handleSearch(e.target.value)}
            placeholder={t('participants.searchPlaceholder')}
            className="w-full pl-9 pr-3 py-2 text-sm border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors"
          />
        </div>
      )}

      <ul className="space-y-2">
        {paginated.map(user => (
          <li key={user.id} className="flex justify-between items-center p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg border border-gray-100 dark:border-gray-600 transition-colors">
            <span className="font-medium text-gray-700 dark:text-gray-200">{user.name}</span>
            <button
              onClick={() => setDeletingUser({ id: user.id, name: user.name })}
              className="text-gray-400 hover:text-red-600 p-3.5 rounded-md hover:bg-red-50 dark:hover:bg-red-900/30 transition-colors"
              title="Rimuovi"
              aria-label={`Rimuovi ${user.name}`}
            >
              <Trash2 size={18} />
            </button>
          </li>
        ))}
        {filtered.length === 0 && users.length > 0 && (
          <li className="text-gray-500 dark:text-gray-400 text-center py-4 text-sm">{t('participants.noResults', { query: searchQuery })}</li>
        )}
        {users.length === 0 && (
          <li className="text-gray-500 dark:text-gray-400 text-center py-4 text-sm">{t('participants.empty')}</li>
        )}
      </ul>

      {totalPages > 1 && (
        <div className="flex items-center justify-between mt-3 pt-3 border-t border-gray-100 dark:border-gray-700">
          <button
            onClick={() => setPage(p => Math.max(0, p - 1))}
            disabled={safePage === 0}
            className="flex items-center gap-1 px-2 py-1 text-sm text-gray-600 dark:text-gray-400 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          >
            <ChevronLeft size={16} />
            {t('pagination.prev')}
          </button>
          <span className="text-xs text-gray-500 dark:text-gray-400">
            {safePage + 1} / {totalPages}
          </span>
          <button
            onClick={() => setPage(p => Math.min(totalPages - 1, p + 1))}
            disabled={safePage === totalPages - 1}
            className="flex items-center gap-1 px-2 py-1 text-sm text-gray-600 dark:text-gray-400 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          >
            {t('pagination.next')}
            <ChevronRight size={16} />
          </button>
        </div>
      )}

      <ConfirmDeleteModal
        isOpen={deletingUser !== null}
        onConfirm={() => {
          if (deletingUser) {
            handleRemove(deletingUser.id, deletingUser.name);
            setDeletingUser(null);
          }
        }}
        onCancel={() => setDeletingUser(null)}
      />
    </div>
  );
}
