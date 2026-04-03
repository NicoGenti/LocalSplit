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
  amount: number;       // importo arrotondato ai 5 centesimi (solo per visualizzazione)
  exactAmount: number;  // importo esatto per azzerare il saldo (usato dal bottone Salda)
}

export interface GroupState {
  name: string;
  users: User[];
  expenses: Expense[];
}
