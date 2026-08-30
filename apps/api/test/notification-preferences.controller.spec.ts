import { Test, TestingModule } from '@nestjs/testing';
import { NotificationPreferencesController } from '../src/notification-preferences/notification-preferences.controller';
import { NotificationPreferencesService } from '../src/notification-preferences/notification-preferences.service';
import { NotificationsService } from '../src/notifications/notifications.service';
import { PrismaService } from '../src/prisma/prisma.service';

describe('NotificationPreferencesController', () => {
  let controller: NotificationPreferencesController;
  let service: jest.Mocked<NotificationPreferencesService>;

  beforeEach(async () => {
    service = {
      getPreferences: jest.fn(),
      updatePreferences: jest.fn(),
    } as any;

    const module: TestingModule = await Test.createTestingModule({
      controllers: [NotificationPreferencesController],
      providers: [NotificationPreferencesService, NotificationsService, PrismaService, { provide: NotificationPreferencesService, useValue: service }],
    }).compile();

    controller = module.get<NotificationPreferencesController>(NotificationPreferencesController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('getPreferences should call service', async () => {
    service.getPreferences.mockResolvedValue({ id: '1', userId: '1', budgetAlerts: true } as any);
    const req = { user: { id: '1' } } as any;
    const result = await controller.getPreferences(req);
    expect(service.getPreferences).toHaveBeenCalledWith('1');
  });

  it('updatePreferences should call service', async () => {
    service.updatePreferences.mockResolvedValue({ id: '1', userId: '1', budgetAlerts: false } as any);
    const req = { user: { id: '1' } } as any;
    const result = await controller.updatePreferences(req, { budgetAlerts: false });
    expect(service.updatePreferences).toHaveBeenCalledWith('1', { budgetAlerts: false });
  });
});