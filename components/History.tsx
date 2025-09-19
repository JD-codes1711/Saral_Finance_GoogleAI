import React, { useState, useMemo } from 'react';
import type { Transaction, TransactionType } from '../types';
import { EXPENSE_CATEGORIES, INCOME_CATEGORIES } from '../constants';
import { TrashIcon } from './icons/Icons';

interface HistoryProps {
  transactions: Transaction[];
  deleteTransaction: (id: number) => void;
}

type SortOption = 'date-desc' | 'date-asc' | 'amount-desc' | 'amount-asc';

const History: React.FC<HistoryProps> = ({ transactions, deleteTransaction }) => {
  const [typeFilter, setTypeFilter] = useState<TransactionType | 'all'>('all');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [sortOption, setSortOption] = useState<SortOption>('date-desc');

  const filteredAndSortedTransactions = useMemo(() => {
    let result = [...transactions];

    if (typeFilter !== 'all') {
      result = result.filter(t => t.type === typeFilter);
    }
    
    if (categoryFilter !== 'all') {
      result = result.filter(t => t.category === categoryFilter);
    }

    result.sort((a, b) => {
      switch (sortOption) {
        case 'date-asc':
          return new Date(a.date).getTime() - new Date(b.date).getTime();
        case 'amount-desc':
          return b.amount - a.amount;
        case 'amount-asc':
          return a.amount - b.amount;
        case 'date-desc':
        default:
          return new Date(b.date).getTime() - new Date(a.date).getTime();
      }
    });

    return result;
  }, [transactions, typeFilter, categoryFilter, sortOption]);

  const categories = typeFilter === 'income' ? INCOME_CATEGORIES : EXPENSE_CATEGORIES;

  const handleExport = () => {
    const headers = 'type,amount,category,description,date';
    // Escape commas in description and category
    const escapeCSV = (str: string) => `"${str.replace(/"/g, '""')}"`;

    const rows = filteredAndSortedTransactions.map(t => 
      [t.type, t.amount, escapeCSV(t.category), escapeCSV(t.description), t.date].join(',')
    ).join('\n');

    const csvContent = `${headers}\n${rows}`;
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', 'transactions.csv');
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="bg-white p-6 rounded-xl shadow-lg space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-dark-text">Transaction History</h2>
        <button
          onClick={handleExport}
          className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-orange-600 transition-colors font-medium"
          disabled={transactions.length === 0}
        >
          Export as CSV
        </button>
      </div>
      
      {/* Filters and Sorting */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <div>
          <label htmlFor="typeFilter" className="block text-sm font-medium text-gray-700">Filter by Type</label>
          <select id="typeFilter" value={typeFilter} onChange={(e) => { setTypeFilter(e.target.value as TransactionType | 'all'); setCategoryFilter('all'); }} className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-primary focus:border-primary sm:text-sm rounded-md">
            <option value="all">All</option>
            <option value="income">Income</option>
            <option value="expense">Expense</option>
          </select>
        </div>
        <div>
          <label htmlFor="categoryFilter" className="block text-sm font-medium text-gray-700">Filter by Category</label>
          <select id="categoryFilter" value={categoryFilter} onChange={(e) => setCategoryFilter(e.target.value)} className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-primary focus:border-primary sm:text-sm rounded-md" disabled={typeFilter === 'all'}>
            <option value="all">All</option>
            {categories.map(cat => <option key={cat} value={cat}>{cat}</option>)}
          </select>
        </div>
        <div>
          <label htmlFor="sortOption" className="block text-sm font-medium text-gray-700">Sort by</label>
          <select id="sortOption" value={sortOption} onChange={(e) => setSortOption(e.target.value as SortOption)} className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-primary focus:border-primary sm:text-sm rounded-md">
            <option value="date-desc">Date (Newest First)</option>
            <option value="date-asc">Date (Oldest First)</option>
            <option value="amount-desc">Amount (High to Low)</option>
            <option value="amount-asc">Amount (Low to High)</option>
          </select>
        </div>
      </div>
      
      {/* Transaction List */}
      <div className="space-y-4">
        {filteredAndSortedTransactions.length > 0 ? (
          filteredAndSortedTransactions.map(t => (
            <div key={t.id} className="flex items-center justify-between p-4 rounded-lg border border-gray-200 hover:shadow-md transition-shadow">
              <div className="flex items-center space-x-4">
                <div className={`w-2 h-12 rounded-full ${t.type === 'income' ? 'bg-green-500' : 'bg-red-500'}`}></div>
                <div>
                  <p className="font-bold text-lg">{t.description}</p>
                  <p className="text-sm text-gray-500">{t.category} &bull; {new Date(t.date).toLocaleDateString('en-IN', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
                </div>
              </div>
              <div className="flex items-center space-x-4">
                <span className={`text-xl font-bold ${t.type === 'income' ? 'text-green-600' : 'text-red-600'}`}>
                  {t.type === 'income' ? '+' : '-'}₹{t.amount.toLocaleString('en-IN')}
                </span>
                <button onClick={() => deleteTransaction(t.id)} className="text-gray-400 hover:text-red-600 transition-colors">
                  <TrashIcon className="h-6 w-6" />
                </button>
              </div>
            </div>
          ))
        ) : (
          <p className="text-center text-gray-500 py-8">No transactions found.</p>
        )}
      </div>
    </div>
  );
};

export default History;