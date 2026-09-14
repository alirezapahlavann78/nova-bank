import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Currency } from '@prisma/client';

export interface CreateLoanProductData {
  name: string;
  description?: string;
  currency?: Currency;
  minAmount: number;
  maxAmount: number;
  interestRate: number;
  durationMonths: number;
  installmentFrequency?: string;
  requiredScoreBand?: string;
}

export interface UpdateLoanProductData {
  name?: string;
  description?: string;
  minAmount?: number;
  maxAmount?: number;
  interestRate?: number;
  durationMonths?: number;
  installmentFrequency?: string;
  status?: string;
  isActive?: boolean;
  requiredScoreBand?: string;
}

@Injectable()
export class LoanProductsService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(userId?: string, query?: { activeOnly?: boolean }) {
    const where: any = {};
    if (query?.activeOnly !== false) {
      where.isActive = true;
      where.status = 'ACTIVE';
    } else {
      if (userId) where.userId = userId;
    }

    const products = await this.prisma.loanProduct.findMany({
      where,
      orderBy: { name: 'asc' },
    });

    return products;
  }

  async findOne(id: string, userId?: string) {
    const product = await this.prisma.loanProduct.findUnique({ where: { id } });
    if (!product) throw new NotFoundException('Loan product not found');
    if (userId && product.userId && product.userId !== userId) {
      throw new BadRequestException('Loan product not available');
    }
    return product;
  }

  async create(userId: string, data: CreateLoanProductData) {
    return this.prisma.loanProduct.create({
      data: {
        userId,
        name: data.name,
        description: data.description,
        currency: data.currency || 'IRT',
        minAmount: data.minAmount,
        maxAmount: data.maxAmount,
        interestRate: data.interestRate,
        durationMonths: data.durationMonths,
        installmentFrequency: (data.installmentFrequency || 'MONTHLY') as any,
        requiredScoreBand: data.requiredScoreBand as any,
      },
    });
  }

  async update(id: string, userId: string, data: UpdateLoanProductData) {
    const product = await this.prisma.loanProduct.findFirst({ where: { id, userId } });
    if (!product) throw new NotFoundException('Loan product not found');

    const updateData: any = { updatedAt: new Date() };
    if (data.name) updateData.name = data.name;
    if (data.description !== undefined) updateData.description = data.description;
    if (data.minAmount !== undefined) updateData.minAmount = data.minAmount;
    if (data.maxAmount !== undefined) updateData.maxAmount = data.maxAmount;
    if (data.interestRate !== undefined) updateData.interestRate = data.interestRate;
    if (data.durationMonths !== undefined) updateData.durationMonths = data.durationMonths;
    if (data.installmentFrequency) updateData.installmentFrequency = data.installmentFrequency;
    if (data.status) updateData.status = data.status;
    if (data.isActive !== undefined) updateData.isActive = data.isActive;
    if (data.requiredScoreBand) updateData.requiredScoreBand = data.requiredScoreBand;

    return this.prisma.loanProduct.update({ where: { id }, data: updateData });
  }

  async remove(id: string, userId: string) {
    const product = await this.prisma.loanProduct.findFirst({ where: { id, userId } });
    if (!product) throw new NotFoundException('Loan product not found');
    await this.prisma.loanProduct.update({ where: { id }, data: { status: 'ARCHIVED', isActive: false } });
    return { success: true };
  }
}
