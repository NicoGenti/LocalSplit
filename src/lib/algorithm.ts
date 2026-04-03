import { Expense, Debt, User } from '../types';

/**
 * Calcola i saldi netti per ogni utente.
 * Un saldo positivo significa che l'utente deve ricevere soldi (creditore).
 * Un saldo negativo significa che l'utente deve pagare (debitore).
 */
export function calculateBalances(expenses: Expense[], users: User[]): Record<string, number> {
  const balances: Record<string, number> = {};
  
  // Inizializza i saldi a 0 per tutti gli utenti
  users.forEach(u => balances[u.id] = 0);

  expenses.forEach(expense => {
    // Il pagatore ha anticipato i soldi, quindi il suo saldo aumenta (credito)
    if (balances[expense.payerId] !== undefined) {
      balances[expense.payerId] += expense.amount;
    }

    // I partecipanti alla spesa vedono il loro saldo diminuire (debito)
    expense.splits.forEach(split => {
      if (balances[split.userId] !== undefined) {
        balances[split.userId] -= split.amount;
      }
    });
  });

  // Arrotonda per evitare problemi di precisione in virgola mobile
  Object.keys(balances).forEach(key => {
    balances[key] = Math.round(balances[key] * 100) / 100;
  });

  return balances;
}

/**
 * Algoritmo Greedy per semplificare i debiti.
 * Minimizza il numero di transazioni necessarie per azzerare i saldi.
 */
export function simplifyDebts(balances: Record<string, number>): Debt[] {
  const debtors: { id: string, amount: number }[] = [];
  const creditors: { id: string, amount: number }[] = [];

  // Separa gli utenti in debitori (saldo < 0) e creditori (saldo > 0)
  for (const [id, balance] of Object.entries(balances)) {
    if (balance < -0.01) debtors.push({ id, amount: -balance });
    else if (balance > 0.01) creditors.push({ id, amount: balance });
  }

  // Ordina in modo decrescente per far corrispondere i debiti/crediti più grandi per primi
  debtors.sort((a, b) => b.amount - a.amount);
  creditors.sort((a, b) => b.amount - a.amount);

  const debts: Debt[] = [];
  let i = 0; // Indice debitori
  let j = 0; // Indice creditori

  while (i < debtors.length && j < creditors.length) {
    const debtor = debtors[i];
    const creditor = creditors[j];

    // L'importo da trasferire è il minimo tra il debito rimanente e il credito rimanente
    const amount = Math.min(debtor.amount, creditor.amount);
    
    // Arrotondamento per eccesso ai 5 centesimi (es. 2.53 -> 2.55, 1.76 -> 1.80)
    // Applicato solo alla transazione finale, mantenendo la precisione per i calcoli interni
    const exactAmount = Number(amount.toFixed(2));
    const roundedAmount = Math.ceil(exactAmount * 20) / 20;

    if (roundedAmount > 0) {
      debts.push({
        from: debtor.id,
        to: creditor.id,
        amount: roundedAmount
      });
    }

    // Aggiorna gli importi rimanenti
    debtor.amount -= amount;
    creditor.amount -= amount;

    // Se il debito/credito è stato saldato, passa al prossimo
    if (debtor.amount < 0.01) i++;
    if (creditor.amount < 0.01) j++;
  }

  return debts;
}
