// finance-frontend/src/app/page.tsx
'use client';

import { useState } from 'react';
import axios from 'axios';
import PaymentChart from './components/PaymentChart'; // <-- ІМПОРТ ГРАФІКА

// Типи для даних
interface PaymentDetail {
  month: number;
  principal: number;
  interest: number;
  balance: number;
}

interface CalculationResult {
  monthlyPayment: number;
  totalInterest: number;
  paymentSchedule: PaymentDetail[];
}

// Компонент для відображення текстових результатів та таблиці
function ResultComponent({ data }: { data: CalculationResult | null }) {
  if (!data) return null;

  return (
    <div className="result-container mt-8 p-6 border border-gray-300 rounded-lg shadow-md">
      <h2 className="text-2xl font-semibold mb-4">Результати розрахунку:</h2>
      <p className="text-lg">
        <strong>Щомісячний платіж:</strong> {data.monthlyPayment.toFixed(2)} грн
      </p>
      <p className="text-lg mb-4">
        <strong>Загальна сума переплат (відсотки):</strong> {data.totalInterest.toFixed(2)} грн
      </p>
      <h3 className="text-xl font-semibold mb-3">Графік платежів:</h3>
      <div className="overflow-x-auto">
        <table className="min-w-full border-collapse border border-gray-400">
          <thead className="bg-gray-100">
            <tr>
              <th className="border border-gray-300 px-4 py-2">Місяць</th>
              <th className="border border-gray-300 px-4 py-2">Погашення тіла</th>
              <th className="border border-gray-300 px-4 py-2">Відсотки</th>
              <th className="border border-gray-300 px-4 py-2">Залишок боргу</th>
            </tr>
          </thead>
          <tbody>
            {data.paymentSchedule.map((p) => (
              <tr key={p.month} className="hover:bg-gray-50">
                <td className="border border-gray-300 px-4 py-2 text-center">{p.month}</td>
                <td className="border border-gray-300 px-4 py-2 text-right">{p.principal.toFixed(2)}</td>
                <td className="border border-gray-300 px-4 py-2 text-right">{p.interest.toFixed(2)}</td>
                <td className="border border-gray-300 px-4 py-2 text-right">{p.balance.toFixed(2)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}


export default function Home() {
  const [formData, setFormData] = useState({
    loanAmount: '',
    annualRate: '',
    durationMonths: ''
  });
  const [result, setResult] = useState<CalculationResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    setResult(null);

    try {
      const response = await axios.post('http://localhost:3001/finance/calculate', {
        loanAmount: parseFloat(formData.loanAmount),
        annualRate: parseFloat(formData.annualRate),
        durationMonths: parseInt(formData.durationMonths, 10),
      });
      setResult(response.data);
    } catch (err) {
      console.error("Помилка під час запиту:", err);
      if (axios.isAxiosError(err) && err.response) {
        setError(`Помилка сервера: ${err.response.status} - ${JSON.stringify(err.response.data)}`);
      } else if (err instanceof Error) {
        setError(`Помилка: ${err.message}. Перевірте, чи запущено бекенд на http://localhost:3001.`);
      } else {
        setError('Невідома помилка під час запиту. Перевірте, чи запущено бекенд.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="container mx-auto p-4 md:p-8 max-w-2xl">
      <header className="text-center mb-10">
        <h1 className="text-4xl font-bold text-blue-600">Фінансовий калькулятор кредиту</h1>
      </header>

      <form onSubmit={handleSubmit} className="space-y-6 bg-white p-8 rounded-lg shadow-xl">
        {/* ... поля форми (loanAmount, annualRate, durationMonths) ... */}
        <div>
          <label htmlFor="loanAmount" className="block text-sm font-medium text-gray-700 mb-1">Сума кредиту (грн):</label>
          <input
            type="number"
            name="loanAmount"
            id="loanAmount"
            placeholder="Наприклад, 100000"
            value={formData.loanAmount}
            onChange={handleChange}
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
            required
          />
        </div>
        <div>
          <label htmlFor="annualRate" className="block text-sm font-medium text-gray-700 mb-1">Річна ставка (%):</label>
          <input
            type="number"
            name="annualRate"
            id="annualRate"
            placeholder="Наприклад, 10"
            value={formData.annualRate}
            onChange={handleChange}
            step="0.01"
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
            required
          />
        </div>
        <div>
          <label htmlFor="durationMonths" className="block text-sm font-medium text-gray-700 mb-1">Тривалість (міс.):</label>
          <input
            type="number"
            name="durationMonths"
            id="durationMonths"
            placeholder="Наприклад, 12"
            value={formData.durationMonths}
            onChange={handleChange}
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
            required
          />
        </div>
        <button
          type="submit"
          disabled={isLoading}
          className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:bg-gray-400"
        >
          {isLoading ? 'Розрахунок...' : 'Розрахувати'}
        </button>
      </form>

      {error && (
        <div className="mt-6 p-4 bg-red-100 border border-red-400 text-red-700 rounded-md">
          <p><strong>Сталася помилка:</strong></p>
          <p>{error}</p>
        </div>
      )}

      {/* Відображення текстових результатів та таблиці */}
      {result && <ResultComponent data={result} />}

      {/* Відображення графіка */}
      {result && result.paymentSchedule && result.paymentSchedule.length > 0 && (
        <PaymentChart paymentSchedule={result.paymentSchedule} />
      )}
    </div>
  );
}