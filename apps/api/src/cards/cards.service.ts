import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateCardDto } from './dto/create-card.dto';
import { UpdateCardDto } from './dto/update-card.dto';

@Injectable()
export class CardsService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(userId: string) {
    return this.prisma.card.findMany({ where: { userId, isActive: true }, include: { account: { select: { id: true, name: true, type: true, balance: true, currency: true } } }, orderBy: { createdAt: 'desc' } });
  }

  async findOne(id: string, userId: string) {
    const card = await this.prisma.card.findFirst({ where: { id, userId }, include: { account: { select: { id: true, name: true, type: true, balance: true, currency: true } } } });
    if (!card) throw new NotFoundException('Card not found');
    return card;
  }

  async create(userId: string, dto: CreateCardDto) {
    const account = await this.prisma.account.findFirst({ where: { id: dto.accountId, userId } });
    if (!account) throw new NotFoundException('Account not found');
    if (!account.isActive) throw new ForbiddenException('Cannot create card for inactive account');
    return this.prisma.card.create({
      data: { userId, accountId: dto.accountId, name: dto.name, last4: dto.last4, cardType: dto.cardType as any },
      include: { account: { select: { id: true, name: true, type: true, balance: true, currency: true } } },
    });
  }

  async update(id: string, userId: string, dto: UpdateCardDto) {
    const existing = await this.prisma.card.findFirst({ where: { id, userId } });
    if (!existing) throw new NotFoundException('Card not found');
    return this.prisma.card.update({
      where: { id },
      data: { name: dto.name, last4: dto.last4, cardType: dto.cardType as any, isActive: dto.isActive },
      include: { account: { select: { id: true, name: true, type: true, balance: true, currency: true } } },
    });
  }

  async remove(id: string, userId: string) {
    const existing = await this.prisma.card.findFirst({ where: { id, userId } });
    if (!existing) throw new NotFoundException('Card not found');
    await this.prisma.card.update({ where: { id }, data: { isActive: false } });
    return { success: true };
  }
}