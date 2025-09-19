import React, { useState } from 'react';
import { HashRouter, Routes, Route } from 'react-router-dom';
import Header from './components/Header';
import Dashboard from './components/Dashboard';
import History from './components/History';
import TransactionModal from './components/TransactionModal';
import Advisor from './components/Advisor';
import { useLocalStorage } from './hooks/useLocalStorage';
import type { Transaction } from './types';

const App: React.FC = () => {
  const [transactions, setTransactions] = useLocalStorage<Transaction[]>('transactions', []);
  const [budget, setBudget] = useLocalStorage<number>('monthlyBudget', 5000);
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  const addTransaction = (transaction: Omit<Transaction, 'id'>) => {
    const newTransaction: Transaction = {
      ...transaction,
      id: Date.now(),
    };
    setTransactions(prev => [newTransaction, ...prev]);
  };

  const deleteTransaction = (id: number) => {
    setTransactions(prev => prev.filter(t => t.id !== id));
  };

  return (
    <HashRouter>
      <div className="min-h-screen bg-background text-dark-text">
        <Header />
        <main className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto">
          <Routes>
            <Route
              path="/"
              element={<Dashboard transactions={transactions} budget={budget} setBudget={setBudget} openModal={() => setIsModalOpen(true)} />}
            />
            <Route
              path="/history"
              element={<History transactions={transactions} deleteTransaction={deleteTransaction} />}
            />
            <Route
              path="/advisor"
              element={<Advisor />}
            />
          </Routes>
        </main>
        {isModalOpen && (
          <TransactionModal
            onClose={() => setIsModalOpen(false)}
            onAddTransaction={addTransaction}
          />
        )}
      </div>
    </HashRouter>
  );
};

export default App;