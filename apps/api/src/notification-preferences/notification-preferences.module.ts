import { Module } from '@nestjs/common';
import { NotificationPreferencesController } from './notification-preferences.controller';
import { NotificationPreferencesService } from './notification-preferences.service';
import { PrismaService } from '../prisma/prisma.service';
import { NotificationsService } from '../notifications/notifications.service';

@Module({ controllers: [NotificationPreferencesController], providers: [NotificationPreferencesService, NotificationsService, PrismaService], exports: [NotificationPreferencesService] })
export class NotificationPreferencesModule {}