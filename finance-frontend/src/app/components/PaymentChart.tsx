// finance-frontend/src/app/components/PaymentChart.tsx
'use client';

import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler, // Для заливки під лінією, якщо потрібно
} from 'chart.js';

// Реєструємо необхідні компоненти Chart.js
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

interface PaymentDetail {
  month: number;
  principal: number;
  interest: number;
  balance: number;
}

interface PaymentChartProps {
  paymentSchedule: PaymentDetail[];
}

export default function PaymentChart({ paymentSchedule }: PaymentChartProps) {
  if (!paymentSchedule || paymentSchedule.length === 0) {
    return <p>Дані для графіка відсутні.</p>;
  }

  const chartData = {
    labels: paymentSchedule.map(p => `Місяць ${p.month}`), // Мітки по осі X
    datasets: [
      {
        label: 'Залишок боргу',
        data: paymentSchedule.map(p => p.balance),
        borderColor: 'rgb(54, 162, 235)', // Синій
        backgroundColor: 'rgba(54, 162, 235, 0.5)',
        tension: 0.1,
        // fill: true, // Якщо потрібна заливка під лінією
      },
      {
        label: 'Сплачені відсотки (кумулятивно)',
        data: paymentSchedule.map((p, index, arr) =>
          arr.slice(0, index + 1).reduce((sum, current) => sum + current.interest, 0)
        ),
        borderColor: 'rgb(255, 99, 132)', // Червоний
        backgroundColor: 'rgba(255, 99, 132, 0.5)',
        tension: 0.1,
      },
      {
        label: 'Сплачено тіла кредиту (кумулятивно)',
        data: paymentSchedule.map((p, index, arr) =>
          arr.slice(0, index + 1).reduce((sum, current) => sum + current.principal, 0)
        ),
        borderColor: 'rgb(75, 192, 192)', // Зелений
        backgroundColor: 'rgba(75, 192, 192, 0.5)',
        tension: 0.1,
      }
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false, // Дозволяє графіку краще адаптуватися
    plugins: {
      legend: {
        position: 'top' as const,
      },
      title: {
        display: true,
        text: 'Динаміка погашення кредиту',
        font: {
          size: 16
        }
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        title: {
          display: true,
          text: 'Сума (грн)'
        }
      },
      x: {
        title: {
          display: true,
          text: 'Місяць'
        }
      }
    }
  };

  return (
    <div className="chart-container mt-8 p-4 border border-gray-300 rounded-lg shadow-md" style={{ position: 'relative', height: '400px', width: '100%' }}>
      <Line options={options} data={chartData} />
    </div>
  );
}