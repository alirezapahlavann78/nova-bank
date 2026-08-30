import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateAccountDto } from './dto/create-account.dto';
import { UpdateAccountDto } from './dto/update-account.dto';

@Injectable()
export class AccountsService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(userId: string) {
    return this.prisma.account.findMany({ where: { userId, isActive: true }, include: { bank: { select: { id: true, code: true, name: true, nameEn: true } } }, orderBy: { createdAt: 'desc' } });
  }

  async findOne(id: string, userId: string) {
    const account = await this.prisma.account.findFirst({ where: { id, userId }, include: { bank: { select: { id: true, code: true, name: true, nameEn: true } } } });
    if (!account) throw new NotFoundException('Account not found');
    return account;
  }

  async create(userId: string, dto: CreateAccountDto) {
    if (dto.bankId) {
      const bank = await this.prisma.bank.findUnique({ where: { id: dto.bankId } });
      if (!bank) throw new NotFoundException('Bank not found');
    }
    return this.prisma.account.create({
      data: { userId, bankId: dto.bankId, name: dto.name, type: dto.type as any, accountNumber: dto.accountNumber, currency: dto.currency as any, balance: dto.initialBalance ?? 0 },
      include: { bank: { select: { id: true, code: true, name: true, nameEn: true } } },
    });
  }

  async update(id: string, userId: string, dto: UpdateAccountDto) {
    const existing = await this.prisma.account.findFirst({ where: { id, userId } });
    if (!existing) throw new NotFoundException('Account not found');
    return this.prisma.account.update({
      where: { id },
      data: { name: dto.name, accountNumber: dto.accountNumber, bankId: dto.bankId, isActive: dto.isActive },
      include: { bank: { select: { id: true, code: true, name: true, nameEn: true } } },
    });
  }

  async remove(id: string, userId: string) {
    const existing = await this.prisma.account.findFirst({ where: { id, userId } });
    if (!existing) throw new NotFoundException('Account not found');
    await this.prisma.account.update({ where: { id }, data: { isActive: false } });
    return { success: true };
  }
}