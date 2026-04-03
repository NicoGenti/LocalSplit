export interface User {
  id: string;
  name: string;
}

export type SplitType = 'EQUAL' | 'CUSTOM';

export interface Split {
  userId: string;
  amount: number;
}

export type ExpenseCategory = 'cibo' | 'trasporti' | 'altro';

export interface Expense {
  id: string;
  title: string;
  amount: number;
  payerId: string;
  date: string;
  category?: ExpenseCategory;
  splitType: SplitType;
  splits: Split[];
}

export interface Debt {
  from: string;
  to: string;
  amount: number;
}

export interface GroupState {
  name: string;
  users: User[];
  expenses: Expense[];
}
