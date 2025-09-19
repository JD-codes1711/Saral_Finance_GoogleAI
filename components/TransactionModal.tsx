
import React, { useState } from 'react';
import type { Transaction, TransactionType } from '../types';
import { INCOME_CATEGORIES, EXPENSE_CATEGORIES } from '../constants';

interface TransactionModalProps {
  onClose: () => void;
  onAddTransaction: (transaction: Omit<Transaction, 'id'>) => void;
}

const TransactionModal: React.FC<TransactionModalProps> = ({ onClose, onAddTransaction }) => {
  const [type, setType] = useState<TransactionType>('expense');
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState(EXPENSE_CATEGORIES[0]);
  const [description, setDescription] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);

  const handleTypeChange = (newType: TransactionType) => {
    setType(newType);
    setCategory(newType === 'expense' ? EXPENSE_CATEGORIES[0] : INCOME_CATEGORIES[0]);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!amount || !description) {
      alert("Please fill in all fields.");
      return;
    }

    onAddTransaction({
      type,
      amount: parseFloat(amount),
      category,
      description,
      date,
    });
    onClose();
  };

  const categories = type === 'expense' ? EXPENSE_CATEGORIES : INCOME_CATEGORIES;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl p-8 w-full max-w-md space-y-6 animate-fade-in-up">
        <h2 className="text-2xl font-bold text-center">Add Transaction</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Type Radio */}
          <div className="flex justify-center space-x-4">
            <label className={`cursor-pointer px-6 py-2 rounded-lg border-2 ${type === 'expense' ? 'border-primary bg-primary/10 text-primary' : 'border-gray-300'}`}>
              <input type="radio" name="type" value="expense" checked={type === 'expense'} onChange={() => handleTypeChange('expense')} className="hidden" />
              Expense
            </label>
            <label className={`cursor-pointer px-6 py-2 rounded-lg border-2 ${type === 'income' ? 'border-primary bg-primary/10 text-primary' : 'border-gray-300'}`}>
              <input type="radio" name="type" value="income" checked={type === 'income'} onChange={() => handleTypeChange('income')} className="hidden" />
              Income
            </label>
          </div>

          {/* Amount */}
          <div>
            <label htmlFor="amount" className="block text-sm font-medium text-gray-700">Amount (₹)</label>
            <input type="number" id="amount" value={amount} onChange={(e) => setAmount(e.target.value)} required className="mt-1 block w-full p-2 border border-gray-300 rounded-md focus:ring-primary focus:border-primary" />
          </div>

          {/* Category */}
          <div>
            <label htmlFor="category" className="block text-sm font-medium text-gray-700">Category</label>
            <select id="category" value={category} onChange={(e) => setCategory(e.target.value)} required className="mt-1 block w-full p-2 border border-gray-300 rounded-md focus:ring-primary focus:border-primary">
              {categories.map(cat => <option key={cat} value={cat}>{cat}</option>)}
            </select>
          </div>

          {/* Description */}
          <div>
            <label htmlFor="description" className="block text-sm font-medium text-gray-700">Description</label>
            <input type="text" id="description" value={description} onChange={(e) => setDescription(e.target.value)} required className="mt-1 block w-full p-2 border border-gray-300 rounded-md focus:ring-primary focus:border-primary" />
          </div>

          {/* Date */}
          <div>
            <label htmlFor="date" className="block text-sm font-medium text-gray-700">Date</label>
            <input type="date" id="date" value={date} onChange={(e) => setDate(e.target.value)} required className="mt-1 block w-full p-2 border border-gray-300 rounded-md focus:ring-primary focus:border-primary" />
          </div>

          {/* Buttons */}
          <div className="flex justify-end space-x-4 pt-2">
            <button type="button" onClick={onClose} className="px-6 py-2 rounded-lg border border-gray-300 hover:bg-gray-100 transition-colors">Cancel</button>
            <button type="submit" className="px-6 py-2 rounded-lg bg-primary text-white hover:bg-orange-600 transition-colors">Save</button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default TransactionModal;
