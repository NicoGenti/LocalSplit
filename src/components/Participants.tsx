import React, { useState } from 'react';
import { useGroupStore } from '../store/useGroupStore';
import { UserPlus, Trash2 } from 'lucide-react';
import { toast } from 'react-hot-toast';

export function Participants() {
  const { users, addUser, removeUser } = useGroupStore();
  const [newName, setNewName] = useState('');

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (newName.trim()) {
      addUser(newName.trim());
      toast.success(`${newName.trim()} aggiunto al gruppo`);
      setNewName('');
    }
  };

  const handleRemove = (id: string, name: string) => {
    removeUser(id);
    toast.success(`${name} rimosso dal gruppo`);
  };

  return (
    <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 transition-colors duration-200">
      <h2 className="text-xl font-semibold mb-4 text-gray-800 dark:text-white">Partecipanti</h2>
      
      <form onSubmit={handleAdd} className="flex gap-2 mb-4">
        <input
          type="text"
          value={newName}
          onChange={(e) => setNewName(e.target.value)}
          placeholder="Nome partecipante..."
          className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors"
        />
        <button
          type="submit"
          disabled={!newName.trim()}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50 flex items-center gap-2 transition-colors"
        >
          <UserPlus size={18} />
          <span>Aggiungi</span>
        </button>
      </form>

      <ul className="space-y-2">
        {users.map(user => (
          <li key={user.id} className="flex justify-between items-center p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg border border-gray-100 dark:border-gray-600 transition-colors">
            <span className="font-medium text-gray-700 dark:text-gray-200">{user.name}</span>
            <button
              onClick={() => handleRemove(user.id, user.name)}
              className="text-gray-400 hover:text-red-600 p-1.5 rounded-md hover:bg-red-50 dark:hover:bg-red-900/30 transition-colors"
              title="Rimuovi"
            >
              <Trash2 size={18} />
            </button>
          </li>
        ))}
        {users.length === 0 && (
          <li className="text-gray-500 dark:text-gray-400 text-center py-4 text-sm">Nessun partecipante. Aggiungine uno!</li>
        )}
      </ul>
    </div>
  );
}
