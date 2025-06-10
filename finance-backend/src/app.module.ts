import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { FinanceModule } from './finance/finance.module';
import { FinanceController } from './finance.controller';
import { FinanceService } from './finance.service';

@Module({
  imports: [FinanceModule],
  controllers: [AppController, FinanceController],
  providers: [AppService, FinanceService],
})
export class AppModule {}
