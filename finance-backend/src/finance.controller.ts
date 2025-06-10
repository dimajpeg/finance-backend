// finance-backend/src/finance.controller.ts (або src/finance.controller.ts)
import { Controller, Post, Body, HttpCode, HttpStatus } from '@nestjs/common';
import { FinanceService } from './finance.service'; // Або '../finance.service'
import { CalculateDto } from './finance/dto/calculate.dto'; // Або './finance/dto/calculate.dto'
import { ResultDto } from './finance/dto/result.dto'; // Або './finance/dto/result.dto'

@Controller('finance')
export class FinanceController {
  constructor(private readonly financeService: FinanceService) {}

  @Post('calculate')
  @HttpCode(HttpStatus.OK)
  // Метод тепер асинхронний і повертає Promise<ResultDto>
  async calculate(@Body() dto: CalculateDto): Promise<ResultDto> {
    return await this.financeService.calculateLoan(dto); // Додаємо await
  }
}
