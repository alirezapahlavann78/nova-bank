import { Test, TestingModule } from '@nestjs/testing';
import { NotificationsService } from '../src/notifications/notifications.service';
import { PrismaService } from '../src/prisma/prisma.service';

describe('NotificationsService', () => {
  let service: NotificationsService;
  let prisma: jest.Mocked<PrismaService>;

  beforeEach(async () => {
    prisma = {
      notification: {
        findMany: jest.fn(),
        findFirst: jest.fn(),
        create: jest.fn(),
        update: jest.fn(),
        updateMany: jest.fn(),
        delete: jest.fn(),
        count: jest.fn(),
      },
      notificationPreference: {
        findUnique: jest.fn(),
        create: jest.fn(),
        upsert: jest.fn(),
      },
    } as any;

    const module: TestingModule = await Test.createTestingModule({
      providers: [NotificationsService, PrismaService, { provide: PrismaService, useValue: prisma }],
    }).compile();

    service = module.get<NotificationsService>(NotificationsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('findOne should throw NotFoundException for missing notification', async () => {
    prisma.notification.findFirst.mockResolvedValue(null);
    await expect(service.findOne('missing', '1')).rejects.toThrow('Notification not found');
  });

  it('getPreferences should create default preferences when missing', async () => {
    prisma.notificationPreference.findUnique.mockResolvedValue(null);
    prisma.notificationPreference.create.mockResolvedValue({
      id: '1', userId: '1', budgetAlerts: true, goalAlerts: true, transactionAlerts: false, transferAlerts: false, systemAlerts: true, pushEnabled: true, createdAt: new Date(), updatedAt: new Date(),
    });
    const result = await service.getPreferences('1');
    expect(result.budgetAlerts).toBe(true);
    expect(prisma.notificationPreference.create).toHaveBeenCalled();
  });
});