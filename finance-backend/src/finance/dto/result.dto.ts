// dto/result.dto.ts
export class ResultDto {
  monthlyPayment: number;
  totalInterest: number;
  paymentSchedule: {
    month: number;
    principal: number;
    interest: number;
    balance: number;
  }[];
}
