import { Controller, Get, Patch, Body, UseGuards, Request } from '@nestjs/common';
import { NotificationPreferencesService } from './notification-preferences.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('notifications/preferences')
@UseGuards(JwtAuthGuard)
export class NotificationPreferencesController {
  constructor(private readonly notificationPreferencesService: NotificationPreferencesService) {}

  @Get() async getPreferences(@Request() req: any) {
    return this.notificationPreferencesService.getPreferences(req.user.id);
  }

  @Patch() async updatePreferences(@Request() req: any, @Body() data: any) {
    return this.notificationPreferencesService.updatePreferences(req.user.id, data);
  }
}