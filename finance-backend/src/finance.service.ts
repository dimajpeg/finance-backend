// finance-backend/src/finance.service.ts
import { Injectable, Logger } from '@nestjs/common'; // Додано Logger
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CalculateDto } from './finance/dto/calculate.dto'; // Шлях до DTO
import { ResultDto } from './finance/dto/result.dto'; // Шлях до DTO
import { CalculationHistoryEntity } from './finance/calculation-history.entity'; // Шлях до Entity

@Injectable()
export class FinanceService {
  // Ініціалізація логера
  private readonly logger = new Logger(FinanceService.name);

  constructor(
    @InjectRepository(CalculationHistoryEntity)
    private historyRepository: Repository<CalculationHistoryEntity>,
  ) {}

  async calculateLoan(data: CalculateDto): Promise<ResultDto> {
    const { loanAmount, annualRate, durationMonths } = data;
    this.logger.log(
      `Calculating loan for amount: ${loanAmount}, rate: ${annualRate}, duration: ${durationMonths} months`,
    );

    const monthlyRate = annualRate / 12 / 100;

    if (durationMonths <= 0) {
      this.logger.error('Duration in months must be greater than 0.', data);
      throw new Error('Duration in months must be greater than 0.');
    }

    let monthlyPayment: number;
    const result: ResultDto = {
      monthlyPayment: 0,
      totalInterest: 0,
      paymentSchedule: [],
    };

    if (monthlyRate === 0) {
      monthlyPayment = loanAmount / durationMonths;
      result.monthlyPayment = parseFloat(monthlyPayment.toFixed(2));
      result.totalInterest = 0;
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
    } else {
      monthlyPayment =
        (loanAmount * monthlyRate * Math.pow(1 + monthlyRate, durationMonths)) /
        (Math.pow(1 + monthlyRate, durationMonths) - 1);

      if (!isFinite(monthlyPayment)) {
        this.logger.error(
          'Calculation error: monthlyPayment is not finite.',
          data,
        );
        throw new Error(
          'Invalid input data for loan calculation resulting in non-finite monthly payment.',
        );
      }

      result.monthlyPayment = parseFloat(monthlyPayment.toFixed(2));
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
    }

    await this.saveCalculationToHistory(data, result);
    return result;
  }

  private async saveCalculationToHistory(
    params: CalculateDto,
    result: ResultDto,
  ): Promise<void> {
    try {
      const historyEntry = this.historyRepository.create({
        loanAmount: params.loanAmount,
        annualRate: params.annualRate,
        durationMonths: params.durationMonths,
        monthlyPayment: result.monthlyPayment,
        totalInterest: result.totalInterest,
      });
      const savedEntry = await this.historyRepository.save(historyEntry);
      this.logger.log(`Calculation saved to history with ID: ${savedEntry.id}`);
    } catch (e) {
      this.logger.error('Failed to save calculation to history', e);
      // Виріши, чи потрібно кидати помилку далі, чи просто логувати
    }
  }

  async getHistory(): Promise<CalculationHistoryEntity[]> {
    this.logger.log('Fetching calculation history...');
    return this.historyRepository.find({
      order: {
        calculationDate: 'DESC',
      },
    });
  }
}
