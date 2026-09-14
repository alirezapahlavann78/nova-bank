import { Injectable } from '@nestjs/common';
import { LoanProduct } from '@prisma/client';

export interface InstallmentCalculation {
  installmentNumber: number;
  principalAmount: number;
  interestAmount: number;
  totalAmount: number;
  dueDate: Date;
}

export interface LoanCalculation {
  principal: number;
  interestAmount: number;
  totalPayable: number;
  installmentAmount: number;
  installments: InstallmentCalculation[];
}

const ONE_CENT = 1;

@Injectable()
export class LoanCalculationService {
  calculateLoan(params: {
    principal: number;
    annualInterestRate: number;
    durationMonths: number;
    startDate: Date;
    currency: string;
  }): LoanCalculation {
    const { principal, annualInterestRate, durationMonths, startDate } = params;

    const principalCents = principal;
    const monthlyRate = annualInterestRate / 12 / 100;

    let installmentAmount: number;

    if (monthlyRate === 0) {
      installmentAmount = Math.floor(principalCents / durationMonths);
    } else {
      const numerator = principalCents * monthlyRate * Math.pow(1 + monthlyRate, durationMonths);
      const denominator = Math.pow(1 + monthlyRate, durationMonths) - 1;
      installmentAmount = Math.round(numerator / denominator);
    }

    if (installmentAmount < 1) installmentAmount = 1;

    let remainingPrincipal = principalCents;
    let totalInterest = 0;
    const installments: InstallmentCalculation[] = [];

    for (let i = 0; i < durationMonths; i++) {
      const interestAmount = Math.round(remainingPrincipal * monthlyRate);
      totalInterest += interestAmount;
      const principalPayment = Math.max(installmentAmount - interestAmount, 0);
      remainingPrincipal -= principalPayment;
      remainingPrincipal = Math.max(remainingPrincipal, 0);

      const dueDate = new Date(startDate);
      dueDate.setMonth(dueDate.getMonth() + (i + 1));

      installments.push({
        installmentNumber: i + 1,
        principalAmount: principalPayment,
        interestAmount,
        totalAmount: interestAmount + principalPayment,
        dueDate,
      });
    }

    if (remainingPrincipal > 0) {
      installments[durationMonths - 1].totalAmount += remainingPrincipal;
      installments[durationMonths - 1].principalAmount += remainingPrincipal;
      totalInterest -= remainingPrincipal;
    }

    const totalPayable = Math.round(principalCents + totalInterest);

    if (installments.length > 0) {
      installments[durationMonths - 1].totalAmount = totalPayable - installments.slice(0, -1).reduce((s, i) => s + i.totalAmount, 0);
      const lastPrincipal = installments[durationMonths - 1].totalAmount - installments[durationMonths - 1].interestAmount;
      installments[durationMonths - 1].principalAmount = Math.max(lastPrincipal, 0);
    }

    return {
      principal: principalCents,
      interestAmount: totalInterest,
      totalPayable,
      installmentAmount,
      installments,
    };
  }
}
