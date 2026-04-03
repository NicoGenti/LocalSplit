import { Expense, Debt, User } from '../types';

/**
 * Calcola i saldi netti per ogni utente.
 * Un saldo positivo significa che l'utente deve ricevere soldi (creditore).
 * Un saldo negativo significa che l'utente deve pagare (debitore).
 */
export function calculateBalances(expenses: Expense[], users: User[]): Record<string, number> {
  // Usiamo centesimi interi per evitare accumulo di errori floating-point
  const centBalances: Record<string, number> = {};

  // Inizializza i saldi a 0 per tutti gli utenti
  users.forEach(u => centBalances[u.id] = 0);

  expenses.forEach(expense => {
    // Il pagatore ha anticipato i soldi, quindi il suo saldo aumenta (credito)
    if (centBalances[expense.payerId] !== undefined) {
      centBalances[expense.payerId] += Math.round(expense.amount * 100);
    }

    // I partecipanti alla spesa vedono il loro saldo diminuire (debito)
    expense.splits.forEach(split => {
      if (centBalances[split.userId] !== undefined) {
        centBalances[split.userId] -= Math.round(split.amount * 100);
      }
    });
  });

  // Converti i centesimi in euro per il valore finale
  const balances: Record<string, number> = {};
  Object.keys(centBalances).forEach(key => {
    balances[key] = centBalances[key] / 100;
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
    
    // Arrotonda al centesimo più vicino per la visualizzazione
    const exactAmount = Number(amount.toFixed(2));
    const roundedAmount = exactAmount;

    if (exactAmount > 0) {
      debts.push({
        from: debtor.id,
        to: creditor.id,
        amount: roundedAmount,
        exactAmount: exactAmount
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
