// finance-frontend/src/app/page.tsx
'use client';

import { useState, useEffect } from 'react';
import axios from 'axios';
// Припускаємо, що PaymentChart.tsx знаходиться в src/app/components/
// Якщо ні, зміни шлях:
import PaymentChart from './components/PaymentChart';

// ----- ТИПИ ДАНИХ -----
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

// Тип для стану форми
interface FormDataState {
  loanAmount: string;
  annualRate: string;
  durationMonths: string;
}

// Тип для запису історії (розширює CalculationResult та додає поля з CalculateDto)
interface HistoryEntry extends CalculationResult {
  id: string;
  loanAmount: number; // З CalculateDto
  annualRate: number; // З CalculateDto
  durationMonths: number; // З CalculateDto
  calculationDate: string; // Або Date, якщо будеш перетворювати
}

// ----- КОМПОНЕНТИ (можна винести в окремі файли) -----

// Компонент для відображення текстових результатів та таблиці
function ResultComponent({ data }: { data: CalculationResult | null }) {
  if (!data || !data.paymentSchedule || data.paymentSchedule.length === 0) {
    // Додано перевірку на paymentSchedule, щоб уникнути помилок, якщо він порожній
    return null;
  }

  return (
    <div className="result-container mt-8 p-6 border border-gray-300 rounded-lg shadow-md bg-white">
      <h2 className="text-2xl font-semibold mb-4 text-gray-800">Результати розрахунку:</h2>
      <p className="text-lg text-gray-700">
        <strong>Щомісячний платіж:</strong> {data.monthlyPayment.toFixed(2)} грн
      </p>
      <p className="text-lg mb-4 text-gray-700">
        <strong>Загальна сума переплат (відсотки):</strong> {data.totalInterest.toFixed(2)} грн
      </p>
      <h3 className="text-xl font-semibold mb-3 text-gray-800">Графік платежів:</h3>
      <div className="overflow-x-auto">
        <table className="min-w-full border-collapse border border-gray-300">
          <thead className="bg-gray-100">
            <tr>
              <th className="border border-gray-300 px-4 py-2 text-left text-sm font-medium text-gray-600 uppercase tracking-wider">Місяць</th>
              <th className="border border-gray-300 px-4 py-2 text-right text-sm font-medium text-gray-600 uppercase tracking-wider">Погашення тіла</th>
              <th className="border border-gray-300 px-4 py-2 text-right text-sm font-medium text-gray-600 uppercase tracking-wider">Відсотки</th>
              <th className="border border-gray-300 px-4 py-2 text-right text-sm font-medium text-gray-600 uppercase tracking-wider">Залишок боргу</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {data.paymentSchedule.map((p) => (
              <tr key={p.month} className="hover:bg-gray-50">
                <td className="border border-gray-300 px-4 py-2 text-center text-sm text-gray-700">{p.month}</td>
                <td className="border border-gray-300 px-4 py-2 text-right text-sm text-gray-700">{p.principal.toFixed(2)}</td>
                <td className="border border-gray-300 px-4 py-2 text-right text-sm text-gray-700">{p.interest.toFixed(2)}</td>
                <td className="border border-gray-300 px-4 py-2 text-right text-sm text-gray-700">{p.balance.toFixed(2)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// Компонент для відображення історії
function HistoryListComponent({ history }: { history: HistoryEntry[] }) {
  if (!history || history.length === 0) {
    return <p className="mt-8 text-center text-gray-500">Історія розрахунків порожня.</p>;
  }
  return (
    <div className="history-container mt-10 p-6 border border-gray-300 rounded-lg shadow-md bg-white">
      <h2 className="text-2xl font-semibold mb-6 text-gray-800">Історія розрахунків:</h2>
      <ul className="space-y-6">
        {history.map((entry) => {
          // Перетворюємо рядки на числа перед використанням toFixed
          const loanAmountNum = parseFloat(String(entry.loanAmount));
          const annualRateNum = parseFloat(String(entry.annualRate));
          const monthlyPaymentNum = parseFloat(String(entry.monthlyPayment));
          const totalInterestNum = parseFloat(String(entry.totalInterest));

          return (
            <li key={entry.id} className="p-4 bg-gray-50 rounded-md shadow-sm border border-gray-200">
              <p className="text-sm text-gray-500 mb-1"><strong>Дата:</strong> {new Date(entry.calculationDate).toLocaleString('uk-UA', { dateStyle: 'medium', timeStyle: 'short' })}</p>
              <p className="text-gray-700">
                <strong>Сума:</strong> {loanAmountNum.toFixed(2)} грн,
                <strong> Ставка:</strong> {annualRateNum.toFixed(2)}%,
                <strong> Термін:</strong> {entry.durationMonths} міс.
              </p>
              <p className="text-gray-700 mt-1"><strong>Щомісячний платіж:</strong> <span className="font-semibold">{monthlyPaymentNum.toFixed(2)} грн</span></p>
              <p className="text-gray-700"><strong>Переплата:</strong> <span className="font-semibold">{totalInterestNum.toFixed(2)} грн</span></p>
            </li>
          );
        })}
      </ul>
    </div>
  );
}

// ----- ГОЛОВНИЙ КОМПОНЕНТ СТОРІНКИ -----
export default function Home() {
  const [formData, setFormData] = useState<FormDataState>({
    loanAmount: '',
    annualRate: '',
    durationMonths: ''
  });
  const [result, setResult] = useState<CalculationResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const [history, setHistory] = useState<HistoryEntry[]>([]);
  const [isLoadingHistory, setIsLoadingHistory] = useState<boolean>(false);
  const [historyError, setHistoryError] = useState<string | null>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const fetchHistory = async () => {
    setIsLoadingHistory(true);
    setHistoryError(null);
    try {
      const response = await axios.get('http://localhost:3001/finance/history');
      setHistory(response.data);
    } catch (err) {
      console.error("Помилка під час завантаження історії:", err);
      let message = 'Невідома помилка під час завантаження історії.';
      if (axios.isAxiosError(err)) {
        message = err.response ? `Помилка сервера: ${err.response.status} - ${JSON.stringify(err.response.data)}` : `Мережева помилка: ${err.message}. Перевірте, чи запущено бекенд.`;
      } else if (err instanceof Error) {
        message = `Помилка: ${err.message}.`;
      }
      setHistoryError(message);
    } finally {
      setIsLoadingHistory(false);
    }
  };

  useEffect(() => {
    fetchHistory();
  }, []);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    setResult(null); // Очищуємо попередній результат

    // Перевірка чи всі поля заповнені
    if (!formData.loanAmount || !formData.annualRate || !formData.durationMonths) {
      setError("Будь ласка, заповніть всі поля форми.");
      setIsLoading(false);
      return;
    }

    try {
      const response = await axios.post('http://localhost:3001/finance/calculate', {
        loanAmount: parseFloat(formData.loanAmount),
        annualRate: parseFloat(formData.annualRate),
        durationMonths: parseInt(formData.durationMonths, 10),
      });
      setResult(response.data);
      await fetchHistory(); // Оновлюємо історію після нового розрахунку
    } catch (err) {
      console.error("Помилка під час запиту на розрахунок:", err);
      let message = 'Невідома помилка під час розрахунку.';
      if (axios.isAxiosError(err)) {
        message = err.response ? `Помилка сервера: ${err.response.status} - ${JSON.stringify(err.response.data)}` : `Мережева помилка: ${err.message}. Перевірте, чи запущено бекенд.`;
      } else if (err instanceof Error) {
        message = `Помилка: ${err.message}.`;
      }
      setError(message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4 md:px-8 max-w-3xl"> {/* Збільшив max-w */}
        <header className="text-center mb-12">
          <h1 className="text-4xl sm:text-5xl font-extrabold text-blue-700">
            Фінансовий калькулятор кредиту 💰
          </h1>
        </header>

        <form onSubmit={handleSubmit} className="space-y-6 bg-white p-6 md:p-8 rounded-xl shadow-2xl mb-12">
          <div>
            <label htmlFor="loanAmount" className="block text-sm font-medium text-gray-700 mb-1">Сума кредиту (грн):</label>
            <input
              type="number"
              name="loanAmount"
              id="loanAmount"
              placeholder="Наприклад, 100000"
              value={formData.loanAmount}
              onChange={handleChange}
              className="mt-1 block w-full px-4 py-3 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              required
              min="1" // Додав мінімальне значення
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
              min="0.01" // Додав мінімальне значення
              className="mt-1 block w-full px-4 py-3 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
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
              min="1" // Додав мінімальне значення
              className="mt-1 block w-full px-4 py-3 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              required
            />
          </div>
          <button
            type="submit"
            disabled={isLoading}
            className="w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-base font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
          >
            {isLoading ? 'Розрахунок...' : 'Розрахувати'}
          </button>
        </form>

        {error && (
          <div className="mt-6 p-4 bg-red-50 border border-red-300 text-red-700 rounded-md shadow-sm">
            <p className="font-semibold">Сталася помилка розрахунку:</p>
            <p className="text-sm">{error}</p>
          </div>
        )}

        {result && <ResultComponent data={result} />}

        {result && result.paymentSchedule && result.paymentSchedule.length > 0 && (
          <PaymentChart paymentSchedule={result.paymentSchedule} />
        )}

        {/* Блок для відображення історії */}
        {isLoadingHistory && <p className="mt-8 text-center text-blue-600 text-lg">Завантаження історії розрахунків...</p>}
        {historyError && (
          <div className="mt-8 p-4 bg-red-50 border border-red-300 text-red-700 rounded-md shadow-sm">
            <p className="font-semibold">Помилка завантаження історії:</p>
            <p className="text-sm">{historyError}</p>
          </div>
        )}
        {!isLoadingHistory && !historyError && <HistoryListComponent history={history} />}
      </div>
    </div>
  );
}