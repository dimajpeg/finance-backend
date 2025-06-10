// finance-backend/src/finance/finance.module.ts
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { FinanceService } from '../finance.service';
import { FinanceController } from '../finance.controller';
import { CalculationHistoryEntity } from './calculation-history.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([CalculationHistoryEntity]), // Реєструємо сутність для цього модуля
  ],
  controllers: [FinanceController], // FinanceController реєструється тут
  providers: [FinanceService], // FinanceService реєструється тут
})
export class FinanceModule {}
