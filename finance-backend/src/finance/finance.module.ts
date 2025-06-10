// finance-backend/src/finance/finance.module.ts
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
// Шляхи до сервісу та контролера, які, згідно з твоїм останнім скріншотом структури,
// знаходяться на рівень вище (в src/)
import { FinanceService } from '../finance.service';
import { FinanceController } from '../finance.controller';
// Шлях до сутності, яка знаходиться в цій же теці 'finance'
import { CalculationHistoryEntity } from './calculation-history.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([CalculationHistoryEntity]), // Реєструємо сутність для цього модуля
  ],
  controllers: [FinanceController], // FinanceController реєструється тут
  providers: [FinanceService], // FinanceService реєструється тут
})
export class FinanceModule {}
