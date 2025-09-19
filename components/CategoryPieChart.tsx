
import React from 'react';
import { Pie } from 'react-chartjs-2';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';
import type { Transaction } from '../types';

ChartJS.register(ArcElement, Tooltip, Legend);

interface CategoryPieChartProps {
  transactions: Transaction[];
}

const CategoryPieChart: React.FC<CategoryPieChartProps> = ({ transactions }) => {
  const data = React.useMemo(() => {
    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();

    const categoryTotals = transactions
      .filter(t => {
        const tDate = new Date(t.date);
        return t.type === 'expense' && tDate.getMonth() === currentMonth && tDate.getFullYear() === currentYear;
      })
      .reduce((acc, t) => {
        acc[t.category] = (acc[t.category] || 0) + t.amount;
        return acc;
      }, {} as { [key: string]: number });

    const labels = Object.keys(categoryTotals);
    const chartData = Object.values(categoryTotals);

    return {
      labels,
      datasets: [
        {
          label: 'Expenses',
          data: chartData,
          backgroundColor: [
            '#FF7F2A', '#FFB74D', '#FFD54F', '#4CAF50', '#2196F3', '#9C27B0', '#F44336', '#795548'
          ],
          borderColor: '#FFF8F0',
          borderWidth: 2,
        },
      ],
    };
  }, [transactions]);
  
  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'bottom' as const,
        labels: {
            font: {
                family: 'Poppins'
            }
        }
      },
    },
  };

  if (data.labels.length === 0) {
    return <p className="text-center text-gray-500 py-10">No expense data for this month.</p>;
  }

  return <div className="h-80"><Pie data={data} options={options} /></div>;
};

export default CategoryPieChart;
