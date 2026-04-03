import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { User, Expense, GroupState } from '../types';
import { v4 as uuidv4 } from 'uuid';

interface GroupStore extends GroupState {
  setName: (name: string) => void;
  addUser: (name: string) => void;
  removeUser: (id: string) => void;
  addExpense: (expense: Omit<Expense, 'id' | 'date'>) => void;
  updateExpense: (id: string, expense: Omit<Expense, 'id' | 'date'>) => void;
  removeExpense: (id: string) => void;
  importState: (state: GroupState) => void;
  reset: () => void;
}

export const useGroupStore = create<GroupStore>()(
  persist(
    (set) => ({
      name: 'Nuovo Gruppo',
      users: [],
      expenses: [],
      setName: (name) => set({ name }),
      addUser: (name) => set((state) => ({ 
        users: [...state.users, { id: uuidv4(), name }] 
      })),
      removeUser: (id) => set((state) => ({
        users: state.users.filter(u => u.id !== id),
        // Rimuoviamo anche le spese in cui l'utente era coinvolto per mantenere la consistenza
        expenses: state.expenses.filter(e => 
          e.payerId !== id && !e.splits.some(s => s.userId === id)
        )
      })),
      addExpense: (expense) => set((state) => ({
        expenses: [...state.expenses, { ...expense, id: uuidv4(), date: new Date().toISOString() }]
      })),
      updateExpense: (id, updatedExpense) => set((state) => ({
        expenses: state.expenses.map(e => 
          e.id === id ? { ...e, ...updatedExpense } : e
        )
      })),
      removeExpense: (id) => set((state) => ({
        expenses: state.expenses.filter(e => e.id !== id)
      })),
      importState: (newState) => {
        if (
          typeof newState === 'object' &&
          newState !== null &&
          typeof newState.name === 'string' &&
          Array.isArray(newState.users) &&
          Array.isArray(newState.expenses)
        ) {
          set(newState);
        }
      },
      reset: () => set({ name: 'Nuovo Gruppo', users: [], expenses: [] })
    }),
    {
      name: 'split-app-storage',
      version: 1,
    }
  )
);
