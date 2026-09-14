import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { VALID_INSTALLMENT_TRANSITIONS } from './lending-state-machine';

@Injectable()
export class LoanInstallmentsService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(userId: string, loanId?: string) {
    const where: any = { userId };
    if (loanId) where.loanId = loanId;
    return this.prisma.loanInstallment.findMany({
      where,
      orderBy: { installmentNumber: 'asc' },
    });
  }

  async findOne(id: string, userId: string) {
    const installment = await this.prisma.loanInstallment.findFirst({
      where: { id, userId },
      include: { loan: { select: { id: true, principal: true, status: true } } },
    });
    if (!installment) throw new NotFoundException('Installment not found');
    return installment;
  }

  isValidTransition(currentStatus: string, targetStatus: string): boolean {
    const allowed = VALID_INSTALLMENT_TRANSITIONS[currentStatus];
    return allowed ? allowed.includes(targetStatus) : false;
  }
}
