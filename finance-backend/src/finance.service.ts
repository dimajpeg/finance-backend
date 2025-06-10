// finance-backend/src/finance.service.ts
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
// Шляхи до DTO та Entity тепер вказують на підтеку 'finance'
import { CalculateDto } from './finance/dto/calculate.dto';
import { ResultDto } from './finance/dto/result.dto';
import { CalculationHistoryEntity } from './finance/calculation-history.entity';

@Injectable()
export class FinanceService {
  // Ін'єктуємо репозиторій для CalculationHistoryEntity
  constructor(
    @InjectRepository(CalculationHistoryEntity)
    private historyRepository: Repository<CalculationHistoryEntity>,
  ) {}

  // Метод розрахунку тепер асинхронний, оскільки ми зберігаємо в БД
  async calculateLoan(data: CalculateDto): Promise<ResultDto> {
    // Повертаємо Promise<ResultDto>
    const { loanAmount, annualRate, durationMonths } = data;
    const monthlyRate = annualRate / 12 / 100;

    if (monthlyRate === 0) {
      // ... (логіка для ставки 0, як була раніше) ...
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
          balance: parseFloat(Math.max(0, balance).toFixed(2)),
        });
      }
      // ЗБЕРІГАЄМО В ІСТОРІЮ
      await this.saveCalculationToHistory(data, result);
      return result;
    }

    const monthlyPayment =
      (loanAmount * monthlyRate * Math.pow(1 + monthlyRate, durationMonths)) /
      (Math.pow(1 + monthlyRate, durationMonths) - 1);

    if (!isFinite(monthlyPayment)) {
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
      const currentBalance = parseFloat(Math.max(0, balance).toFixed(2));
      result.paymentSchedule.push({
        month: i,
        principal: parseFloat(principal.toFixed(2)),
        interest: parseFloat(interest.toFixed(2)),
        balance: currentBalance,
      });
      if (currentBalance === 0 && i < durationMonths) {
        break;
      }
    }
    result.totalInterest = parseFloat(result.totalInterest.toFixed(2));

    // ЗБЕРІГАЄМО В ІСТОРІЮ
    await this.saveCalculationToHistory(data, result);

    return result;
  }

  // Новий приватний метод для збереження історії
  private async saveCalculationToHistory(
    params: CalculateDto,
    result: ResultDto,
  ): Promise<void> {
    const historyEntry = this.historyRepository.create({
      loanAmount: params.loanAmount,
      annualRate: params.annualRate,
      durationMonths: params.durationMonths,
      monthlyPayment: result.monthlyPayment,
      totalInterest: result.totalInterest,
      // calculationDate встановлюється автоматично завдяки @CreateDateColumn
    });
    await this.historyRepository.save(historyEntry);
    console.log('Calculation saved to history:', historyEntry.id); // Логування для перевірки
  }
}
