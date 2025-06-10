// finance-backend/src/finance/calculation-history.entity.ts
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
} from 'typeorm';

@Entity('calculation_history') // Назва таблиці в БД
export class CalculationHistoryEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  // Параметри запиту
  @Column('decimal', { precision: 15, scale: 2 }) // Використовуємо decimal для грошей
  loanAmount: number;

  @Column('decimal', { precision: 5, scale: 2 }) // Ставка може бути з двома знаками після коми
  annualRate: number;

  @Column('int')
  durationMonths: number;

  // Результати розрахунку
  @Column('decimal', { precision: 10, scale: 2 })
  monthlyPayment: number;

  @Column('decimal', { precision: 10, scale: 2 })
  totalInterest: number;

  @CreateDateColumn() // Автоматично встановлює дату створення запису
  calculationDate: Date;
}
