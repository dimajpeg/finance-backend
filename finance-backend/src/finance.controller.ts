// finance-backend/src/finance.controller.ts
import {
  Controller,
  Post,
  Body,
  HttpCode,
  HttpStatus,
  Get,
} from '@nestjs/common';
import { FinanceService } from './finance.service'; // Сервіс знаходиться на тому ж рівні
import { CalculateDto } from './finance/dto/calculate.dto'; // Шлях до DTO
import { ResultDto } from './finance/dto/result.dto'; // Шлях до DTO
import { CalculationHistoryEntity } from './finance/calculation-history.entity'; // Шлях до Entity

@Controller('finance') // Базовий маршрут /finance
export class FinanceController {
  constructor(private readonly financeService: FinanceService) {}

  @Post('calculate') // POST /finance/calculate
  @HttpCode(HttpStatus.OK)
  async calculate(@Body() dto: CalculateDto): Promise<ResultDto> {
    return await this.financeService.calculateLoan(dto);
  }

  @Get('history') // GET /finance/history
  @HttpCode(HttpStatus.OK)
  async getHistory(): Promise<CalculationHistoryEntity[]> {
    return this.financeService.getHistory();
  }
}
