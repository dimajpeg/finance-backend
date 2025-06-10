// finance-backend/src/finance/finance.service.ts
import { Injectable } from '@nestjs/common';
import { CalculateDto } from './finance/dto/calculate.dto';
import { ResultDto } from './finance/dto/result.dto';

@Injectable()
export class FinanceService {
  calculateLoan(data: CalculateDto): ResultDto {
    const { loanAmount, annualRate, durationMonths } = data;
    const monthlyRate = annualRate / 12 / 100;

    // Запобігання діленню на нуль або некоректним ставкам
    if (monthlyRate === 0) {
      // Якщо ставка 0, щомісячний платіж - це просто сума кредиту / кількість місяців
      // Або можна повернути помилку чи спеціальний результат
      const monthlyPayment = loanAmount / durationMonths;
      const result: ResultDto = {
        monthlyPayment: parseFloat(monthlyPayment.toFixed(2)),
        totalInterest: 0,
        paymentSchedule: [],
      };
      let balance = loanAmount;
      for (let i = 1; i <= durationMonths; i++) {
        const principal = monthlyPayment;
        balance -= principal;
        result.paymentSchedule.push({
          month: i,
          principal: parseFloat(principal.toFixed(2)),
          interest: 0,
          balance: parseFloat(Math.max(0, balance).toFixed(2)), // Баланс не може бути < 0
        });
      }
      return result;
    }

    // Формула ануїтетного платежу
    const monthlyPayment =
      (loanAmount * monthlyRate * Math.pow(1 + monthlyRate, durationMonths)) /
      (Math.pow(1 + monthlyRate, durationMonths) - 1);

    // Перевірка на NaN або Infinity, якщо вхідні дані некоректні
    if (!isFinite(monthlyPayment)) {
      // Можна кинути помилку або повернути результат з помилкою
      // Для простоти, поки що повернемо "порожній" результат або специфічну помилку
      // Але краще було б додати валідацію на DTO
      console.error('Calculation error: monthlyPayment is not finite.', data);
      throw new Error(
        'Invalid input data for loan calculation resulting in non-finite monthly payment.',
      );
    }

    const result: ResultDto = {
      monthlyPayment: parseFloat(monthlyPayment.toFixed(2)),
      totalInterest: 0,
      paymentSchedule: [],
    };
    let balance = loanAmount;

    for (let i = 1; i <= durationMonths; i++) {
      const interest = balance * monthlyRate;
      const principal = monthlyPayment - interest;
      balance -= principal;
      result.totalInterest += interest;

      // Переконаємося, що баланс не стає від'ємним через округлення
      const currentBalance = parseFloat(Math.max(0, balance).toFixed(2));

      result.paymentSchedule.push({
        month: i,
        principal: parseFloat(principal.toFixed(2)),
        interest: parseFloat(interest.toFixed(2)),
        balance: currentBalance,
      });

      // Якщо баланс досяг нуля раніше, зупиняємо цикл
      if (currentBalance === 0 && i < durationMonths) {
        // Можна скоригувати останній платіж, якщо потрібно, але для простоти поки так
        break;
      }
    }
    result.totalInterest = parseFloat(result.totalInterest.toFixed(2));
    return result;
  }
}
