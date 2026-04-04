import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { User, Expense, Split, GroupState } from '../types';
import { v4 as uuidv4 } from 'uuid';

interface GroupStore extends GroupState {
  setName: (name: string) => void;
  addUser: (name: string) => void;
  updateUser: (id: string, name: string) => void;
  removeUser: (id: string) => void;
  addExpense: (expense: Omit<Expense, 'id' | 'date'>) => void;
  updateExpense: (id: string, expense: Omit<Expense, 'id' | 'date'>) => void;
  removeExpense: (id: string) => void;
  importState: (state: GroupState) => void;
  setMinDebtThreshold: (threshold: number) => void;
  reset: () => void;
}

export const useGroupStore = create<GroupStore>()(
  persist(
    (set) => ({
      name: 'Nuovo Gruppo',
      users: [],
      expenses: [],
      minDebtThreshold: 0.50,
      setName: (name) => set({ name }),
      addUser: (name) => set((state) => ({
        users: [...state.users, { id: uuidv4(), name }]
      })),
      updateUser: (id, name) => set((state) => ({
        users: state.users.map((u) => u.id === id ? { ...u, name } : u)
      })),
      removeUser: (id) => set((state) => {
        const updatedExpenses = state.expenses
          .map((expense) => {
            const isInSplits = expense.splits.some((s) => s.userId === id);
            const isPayer = expense.payerId === id;

            if (!isInSplits && !isPayer) return expense;

            const removedSplit = expense.splits.find((s) => s.userId === id);
            const remainingSplits = expense.splits.filter((s) => s.userId !== id);

            if (remainingSplits.length === 0) return null;

            let newSplits: Split[];
            if (expense.splitType === 'EQUAL') {
              const perPerson = expense.amount / remainingSplits.length;
              newSplits = remainingSplits.map((s) => ({ ...s, amount: perPerson }));
            } else {
              const removedAmount = removedSplit?.amount ?? 0;
              const bonus = removedAmount / remainingSplits.length;
              newSplits = remainingSplits.map((s) => ({ ...s, amount: s.amount + bonus }));
            }

            const newPayerId = isPayer ? remainingSplits[0].userId : expense.payerId;

            return { ...expense, payerId: newPayerId, splits: newSplits };
          })
          .filter((e): e is Expense => e !== null);

        return {
          users: state.users.filter((u) => u.id !== id),
          expenses: updatedExpenses,
        };
      }),
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
      setMinDebtThreshold: (threshold) => set({ minDebtThreshold: threshold }),
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
      reset: () => set({ name: 'Nuovo Gruppo', users: [], expenses: [], minDebtThreshold: 0.50 })
    }),
    {
      name: 'split-app-storage',
      version: 1,
    }
  )
);
