import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { NotificationsService } from '../notifications/notifications.service';

@Injectable()
export class NotificationPreferencesService {
  constructor(private readonly prisma: PrismaService, private readonly notificationsService: NotificationsService) {}

  async getPreferences(userId: string) {
    return this.notificationsService.getPreferences(userId);
  }

  async updatePreferences(userId: string, data: any) {
    return this.notificationsService.updatePreferences(userId, data);
  }
}