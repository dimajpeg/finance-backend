import { Controller, Post, Body, HttpCode, HttpStatus } from '@nestjs/common';
import { FinanceService } from './finance.service';
import { CalculateDto } from './finance/dto/calculate.dto';
import { ResultDto } from './finance/dto/result.dto';

@Controller('finance') // Маршрут для цього контролера буде /finance
export class FinanceController {
  constructor(private readonly financeService: FinanceService) {}

  @Post('calculate') // Повний шлях буде POST /finance/calculate
  @HttpCode(HttpStatus.OK) // Встановлюємо статус відповіді 200 OK
  calculate(@Body() dto: CalculateDto): ResultDto {
    return this.financeService.calculateLoan(dto);
  }
}
