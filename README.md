<div align="center">
  <img width="1200" height="475" alt="LocalSplit Banner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />
</div>

# LocalSplit

A **local-first Splitwise clone** for managing shared group expenses — no backend, no account, no cloud. Everything lives in your browser.

## Features

- **Group expense management** — track who paid what and for whom
- **Split modes** — divide costs equally or enter exact custom amounts per person
- **Expense categories** — Cibo (food), Trasporti (transport), Altro (other)
- **Debt simplification** — a greedy algorithm minimises the number of repayments needed
- **Settle debts in one tap** — the "Salda" button records a settlement as a new expense
- **Net balances view** — see at a glance who is owed money and who owes
- **Edit and delete** — modify or remove any expense at any time, with confirmation dialogs
- **Dark mode** — togglable from the header
- **Fully offline** — zero network requests at runtime; data is persisted to `localStorage`
- **No environment variables required** — clone and run, nothing to configure

## UI Language

The interface is in **Italian**. The three main tabs are:

| Tab | Meaning |
|---|---|
| Riepilogo | Summary — debt simplification and net balances |
| Spese | Expenses — chronological expense history |
| Gruppo | Group — manage participants |

## Tech Stack

| Layer | Technology |
|---|---|
| UI framework | React 19 + TypeScript |
| Build tool | Vite 6 |
| State & persistence | Zustand 5 with `localStorage` middleware |
| Styling | Tailwind CSS v4 |
| Icons | lucide-react |
| Data compression | lz-string |
| Animations | Motion (Framer Motion v12) |
| Notifications | react-hot-toast |

## How the Debt Algorithm Works

1. Compute each participant's **net balance** (total paid minus their share of all expenses).
2. Split participants into **creditors** (positive balance) and **debtors** (negative balance).
3. A **greedy algorithm** matches the largest debtor with the largest creditor.
4. Repeat until all balances reach zero.
5. Displayed amounts are **rounded to the nearest 5 cents** for simplicity.

This guarantees the minimum possible number of transactions to settle all debts.

## Getting Started

**Prerequisites:** Node.js 18+

```bash
# Install dependencies
npm install

# Start the development server (http://localhost:3000)
npm run dev
```

## Available Scripts

| Script | Description |
|---|---|
| `npm run dev` | Start dev server on port 3000 |
| `npm run build` | Production build to `dist/` |
| `npm run preview` | Preview the production build locally |
| `npm run lint` | TypeScript type-check |
| `npm run clean` | Delete the `dist/` folder |

## Deployment

The app is configured for deployment at the `/LocalSplit/` base path (e.g. GitHub Pages). To deploy at root, change `base` in `vite.config.ts` to `'/'`.

## Project Structure

```
src/
├── App.tsx                  # Root layout, tabs, header, dark mode
├── types.ts                 # Shared TypeScript interfaces
├── store/
│   └── useGroupStore.ts     # Zustand store with localStorage persistence
├── lib/
│   └── algorithm.ts         # Balance calculation and debt simplification
└── components/
    ├── Balances.tsx          # Riepilogo tab
    ├── ExpenseList.tsx       # Spese tab
    ├── Participants.tsx      # Gruppo tab
    ├── AddExpense.tsx        # Expense form
    ├── AddExpenseModal.tsx   # Modal wrapper for AddExpense
    ├── EditExpenseModal.tsx  # Expense editing modal
    └── ConfirmDeleteModal.tsx # Deletion confirmation dialog
```

## License

MIT — see [LICENSE](LICENSE) for details.
