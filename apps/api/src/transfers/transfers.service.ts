import { Injectable, NotFoundException, BadRequestException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { NotificationsService } from '../notifications/notifications.service';
import { CreateTransferDto } from './dto/create-transfer.dto';

@Injectable()
export class TransfersService {
  constructor(private readonly prisma: PrismaService, private readonly notificationsService: NotificationsService) {}

  async findAll(userId: string) {
    return this.prisma.transfer.findMany({
      where: { userId },
      include: { sourceAccount: { select: { id: true, name: true, type: true, currency: true } }, destinationAccount: { select: { id: true, name: true, type: true, currency: true } } },
      orderBy: { transactionDate: 'desc' },
    });
  }

  async findOne(id: string, userId: string) {
    const transfer = await this.prisma.transfer.findFirst({
      where: { id, userId },
      include: { sourceAccount: { select: { id: true, name: true, type: true, currency: true } }, destinationAccount: { select: { id: true, name: true, type: true, currency: true } } },
    });
    if (!transfer) throw new NotFoundException('Transfer not found');
    return transfer;
  }

  async create(userId: string, dto: CreateTransferDto) {
    if (dto.sourceAccountId === dto.destinationAccountId) {
      throw new BadRequestException('Source and destination accounts must differ');
    }

    const [source, destination] = await Promise.all([
      this.prisma.account.findFirst({ where: { id: dto.sourceAccountId, userId } }),
      this.prisma.account.findFirst({ where: { id: dto.destinationAccountId, userId } }),
    ]);

    if (!source) throw new NotFoundException('Source account not found');
    if (!destination) throw new NotFoundException('Destination account not found');
    if (!source.isActive || !destination.isActive) throw new ForbiddenException('Cannot transfer from/to inactive account');
    if (source.balance < dto.amount) throw new BadRequestException('Insufficient balance');

    return this.prisma.$transaction(async (tx: any) => {
      const transfer = await tx.transfer.create({
        data: { userId, sourceAccountId: dto.sourceAccountId, destinationAccountId: dto.destinationAccountId, amount: dto.amount, currency: dto.currency as any, description: dto.description, transactionDate: new Date(dto.transactionDate) },
        include: { sourceAccount: { select: { id: true, name: true, type: true, currency: true } }, destinationAccount: { select: { id: true, name: true, type: true, currency: true } } },
      });

      await tx.account.update({ where: { id: dto.sourceAccountId }, data: { balance: { decrement: dto.amount } } });
      await tx.account.update({ where: { id: dto.destinationAccountId }, data: { balance: { increment: dto.amount } } });

      const preferences = await this.notificationsService.getPreferences(userId);
      if (preferences.transferAlerts) {
        await this.notificationsService.createNotification(
          userId,
          'TRANSFER_COMPLETED',
          'انتقال تکمیل شد',
          `انتقال ${dto.amount} از ${source.name} به ${destination.name} با موفقیت انجام شد.`,
          { transferId: transfer.id },
        );
      }

      return transfer;
    });
  }
}