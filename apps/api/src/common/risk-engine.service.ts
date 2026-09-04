import { Injectable, BadRequestException } from '@nestjs/common';

export enum RiskAction {
  APPROVE = 'APPROVE',
  MEDIUM = 'MEDIUM',
  BLOCK = 'BLOCK',
  REVIEW = 'REVIEW',
}

@Injectable()
export class RiskEngineService {
  evaluate(userId: string, amount: number, currency: string, destinationType: string): { action: RiskAction; reason?: string } {
    if (amount > 500000000) {
      return { action: RiskAction.REVIEW, reason: 'Amount exceeds daily review threshold' };
    }

    if (currency === 'USD' && amount > 10000) {
      return { action: RiskAction.REVIEW, reason: 'USD amount exceeds review threshold' };
    }

    if (currency === 'USD' && amount > 5000) {
      return { action: RiskAction.MEDIUM, reason: 'USD amount exceeds medium risk threshold' };
    }

    if (destinationType === 'CHARITY' && amount > 50000000) {
      return { action: RiskAction.REVIEW, reason: 'Charity payment exceeds review threshold' };
    }

    if (destinationType === 'CHARITY' && amount > 10000000) {
      return { action: RiskAction.MEDIUM, reason: 'Charity payment exceeds medium risk threshold' };
    }

    return { action: RiskAction.APPROVE };
  }
}
