import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class BanksService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll() {
    return this.prisma.bank.findMany({ where: { isActive: true }, select: { id: true, code: true, name: true, nameEn: true }, orderBy: { name: 'asc' } });
  }

  async findOne(id: string) {
    const bank = await this.prisma.bank.findFirst({ where: { id, isActive: true }, select: { id: true, code: true, name: true, nameEn: true } });
    if (!bank) throw new NotFoundException('Bank not found');
    return bank;
  }
}