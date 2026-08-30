import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { NotificationType, NotificationPreference } from '@prisma/client';

@Injectable()
export class NotificationsService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(userId: string, query: any) {
    const where: any = { userId };
    if (query.isRead !== undefined) where.isRead = query.isRead === 'true';
    if (query.type) where.type = query.type as NotificationType;

    const page = query.page ? Number(query.page) : 1;
    const limit = query.limit ? Number(query.limit) : 20;

    const [data, total] = await Promise.all([
      this.prisma.notification.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
      this.prisma.notification.count({ where }),
    ]);

    return { data, page, limit, total, totalPages: Math.ceil(total / limit) };
  }

  async findOne(id: string, userId: string) {
    const notification = await this.prisma.notification.findFirst({ where: { id, userId } });
    if (!notification) throw new NotFoundException('Notification not found');
    return notification;
  }

  async markAsRead(id: string, userId: string) {
    const notification = await this.prisma.notification.findFirst({ where: { id, userId } });
    if (!notification) throw new NotFoundException('Notification not found');

    return this.prisma.notification.update({
      where: { id },
      data: { isRead: true, readAt: new Date() },
    });
  }

  async markAllAsRead(userId: string) {
    await this.prisma.notification.updateMany({
      where: { userId, isRead: false },
      data: { isRead: true, readAt: new Date() },
    });
    return { success: true };
  }

  async remove(id: string, userId: string) {
    const notification = await this.prisma.notification.findFirst({ where: { id, userId } });
    if (!notification) throw new NotFoundException('Notification not found');

    await this.prisma.notification.delete({ where: { id } });
    return { success: true };
  }

  async createNotification(userId: string, type: NotificationType, title: string, body: string, data?: Record<string, any>) {
    return this.prisma.notification.create({
      data: { userId, type, title, body, data: data || undefined },
    });
  }

  async getPreferences(userId: string): Promise<NotificationPreference> {
    let preferences = await this.prisma.notificationPreference.findUnique({
      where: { userId },
    });

    if (!preferences) {
      preferences = await this.prisma.notificationPreference.create({
        data: {
          userId,
          budgetAlerts: true,
          goalAlerts: true,
          transactionAlerts: false,
          transferAlerts: false,
          systemAlerts: true,
          pushEnabled: true,
        },
      });
    }

    return preferences;
  }

  async updatePreferences(userId: string, data: Partial<NotificationPreference>) {
    return this.prisma.notificationPreference.upsert({
      where: { userId },
      update: data,
      create: {
        userId,
        budgetAlerts: data.budgetAlerts ?? true,
        goalAlerts: data.goalAlerts ?? true,
        transactionAlerts: data.transactionAlerts ?? false,
        transferAlerts: data.transferAlerts ?? false,
        systemAlerts: data.systemAlerts ?? true,
        pushEnabled: data.pushEnabled ?? true,
      },
    });
  }

  async hasNotification(userId: string, type: NotificationType, dataKey: string, dataValue: string): Promise<boolean> {
    const count = await this.prisma.notification.count({
      where: {
        userId,
        type,
        data: {
          path: [dataKey],
          equals: dataValue,
        } as any,
      },
    });
    return count > 0;
  }

  async getUnreadCount(userId: string): Promise<number> {
    return this.prisma.notification.count({
      where: { userId, isRead: false },
    });
  }
}