// finance-backend/src/app.module.ts
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm'; // Потрібно для конфігурації БД
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { FinanceModule } from './finance/finance.module'; // Імпортуємо наш модуль

@Module({
  imports: [
    TypeOrmModule.forRoot({
      // Конфігурація TypeORM (як ми робили раніше)
      type: 'postgres',
      host: 'localhost',
      port: 5432,
      username: 'dimamatusenko', // Твоє ім'я користувача
      password: '200405', // Твій пароль
      database: 'finance_calculator_db', // Або як ти назвав свою БД
      entities: [__dirname + '/**/*.entity{.ts,.js}'],
      synchronize: true,
    }),
    FinanceModule, // Просто імпортуємо наш FinanceModule
  ],
  controllers: [AppController], // Тільки AppController тут
  providers: [AppService], // Тільки AppService тут
})
export class AppModule {}
