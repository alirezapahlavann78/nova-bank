import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class LoanPaymentsService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(userId: string, loanId?: string, limit?: number) {
    const where: any = { userId };
    if (loanId) where.loanId = loanId;
    const take = limit ? Math.min(limit, 100) : undefined;
    return this.prisma.loanPayment.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      take,
    });
  }

  async findOne(id: string, userId: string) {
    const payment = await this.prisma.loanPayment.findFirst({
      where: { id, userId },
      include: { loan: { select: { id: true, principal: true, status: true } } },
    });
    if (!payment) throw new NotFoundException('Loan payment not found');
    return payment;
  }
}
