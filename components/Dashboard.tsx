
import React, { useMemo } from 'react';
import type { Transaction } from '../types';
import CategoryPieChart from './CategoryPieChart';
import DailyExpenseBarChart from './DailyExpenseBarChart';
import { PlusCircleIcon, BanknotesIcon, ArrowTrendingUpIcon, ArrowTrendingDownIcon } from './icons/Icons';

interface DashboardProps {
  transactions: Transaction[];
  budget: number;
  setBudget: (value: number) => void;
  openModal: () => void;
}

const Dashboard: React.FC<DashboardProps> = ({ transactions, budget, setBudget, openModal }) => {
  const { currentMonthIncome, currentMonthExpenses, spentPercentage } = useMemo(() => {
    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();

    const currentMonthTransactions = transactions.filter(t => {
      const tDate = new Date(t.date);
      return tDate.getMonth() === currentMonth && tDate.getFullYear() === currentYear;
    });

    const income = currentMonthTransactions
      .filter(t => t.type === 'income')
      .reduce((sum, t) => sum + t.amount, 0);

    const expenses = currentMonthTransactions
      .filter(t => t.type === 'expense')
      .reduce((sum, t) => sum + t.amount, 0);
    
    const percentage = budget > 0 ? (expenses / budget) * 100 : 0;

    return { 
      currentMonthIncome: income, 
      currentMonthExpenses: expenses,
      spentPercentage: Math.min(percentage, 100)
    };
  }, [transactions, budget]);

  const handleBudgetChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newBudget = parseInt(e.target.value, 10);
    if (!isNaN(newBudget) && newBudget >= 0) {
      setBudget(newBudget);
    }
  };
  
  const progressColor = spentPercentage > 90 ? 'bg-red-500' : spentPercentage > 70 ? 'bg-yellow-500' : 'bg-primary';

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Budget Status Card */}
        <div className="md:col-span-2 bg-white p-6 rounded-xl shadow-lg space-y-4">
          <h2 className="text-xl font-bold text-dark-text">Budget Status</h2>
          <div className="flex justify-between items-baseline">
            <span className="text-3xl font-bold text-primary">₹{currentMonthExpenses.toLocaleString('en-IN')}</span>
            <span className="text-lg font-semibold text-dark-text">of ₹{budget.toLocaleString('en-IN')}</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-5">
            <div
              className={`${progressColor} h-5 rounded-full transition-all duration-500 flex items-center justify-center`}
              style={{ width: `${spentPercentage}%` }}
            >
              {spentPercentage > 15 && (
                <span className="text-white font-bold text-xs">
                  {Math.round(spentPercentage)}% Used
                </span>
              )}
            </div>
          </div>
          <div className="flex items-center space-x-2">
              <BanknotesIcon className="h-6 w-6 text-gray-500" />
              <input 
                type="number"
                value={budget}
                onChange={handleBudgetChange}
                className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                placeholder="Set Monthly Budget"
              />
          </div>
        </div>
        
        {/* Summary Cards */}
        <div className="space-y-6">
            <div className="bg-white p-6 rounded-xl shadow-lg flex items-center justify-between">
                <div>
                    <p className="text-gray-500">Total Income</p>
                    <p className="text-2xl font-bold text-green-600">₹{currentMonthIncome.toLocaleString('en-IN')}</p>
                </div>
                <ArrowTrendingUpIcon className="h-10 w-10 text-green-500" />
            </div>
            <div className="bg-white p-6 rounded-xl shadow-lg flex items-center justify-between">
                <div>
                    <p className="text-gray-500">Total Expense</p>
                    <p className="text-2xl font-bold text-red-600">₹{currentMonthExpenses.toLocaleString('en-IN')}</p>
                </div>
                <ArrowTrendingDownIcon className="h-10 w-10 text-red-500" />
            </div>
        </div>
      </div>

      <button onClick={openModal} className="w-full flex items-center justify-center space-x-2 bg-primary hover:bg-orange-600 text-white font-bold py-4 px-4 rounded-xl shadow-lg transition-transform transform hover:scale-105">
        <PlusCircleIcon className="h-8 w-8" />
        <span className="text-xl">Add New Transaction</span>
      </button>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        <div className="lg:col-span-2 bg-white p-6 rounded-xl shadow-lg">
          <h3 className="text-xl font-bold mb-4 text-center">Spending by Category</h3>
          <CategoryPieChart transactions={transactions} />
        </div>
        <div className="lg:col-span-3 bg-white p-6 rounded-xl shadow-lg">
          <h3 className="text-xl font-bold mb-4 text-center">Daily Expenses (Last 7 Days)</h3>
          <DailyExpenseBarChart transactions={transactions} />
        </div>
      </div>
    </div>
  );
};

export default Dashboard;