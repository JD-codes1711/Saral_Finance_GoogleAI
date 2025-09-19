
import React from 'react';
import { Bar } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from 'chart.js';
import type { Transaction } from '../types';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

interface DailyExpenseBarChartProps {
  transactions: Transaction[];
}

const DailyExpenseBarChart: React.FC<DailyExpenseBarChartProps> = ({ transactions }) => {
  const data = React.useMemo(() => {
    const labels: string[] = [];
    const totals: number[] = [];
    const today = new Date();

    for (let i = 6; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(today.getDate() - i);
      const dateString = date.toISOString().split('T')[0];
      labels.push(date.toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric' }));

      const dayExpenses = transactions
        .filter(t => t.type === 'expense' && t.date === dateString)
        .reduce((sum, t) => sum + t.amount, 0);
      
      totals.push(dayExpenses);
    }

    return {
      labels,
      datasets: [
        {
          label: 'Daily Expenses',
          data: totals,
          backgroundColor: '#FF7F2A', // Changed to primary color for better contrast
          borderRadius: 8,
          borderSkipped: false,
        },
      ],
    };
  }, [transactions]);
  
  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false,
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        grid: {
          display: false
        },
        ticks: {
            callback: function(value: string | number) {
                return '₹' + value;
            }
        }
      },
      x: {
        grid: {
          display: false
        }
      }
    }
  };

  return <div className="h-80"><Bar options={options} data={data} /></div>;
};

export default DailyExpenseBarChart;