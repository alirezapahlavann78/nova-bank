import { Test, TestingModule } from '@nestjs/testing';
import { GoalsService } from '../src/goals/goals.service';
import { PrismaService } from '../src/prisma/prisma.service';
import { NotificationsService } from '../src/notifications/notifications.service';

describe('GoalsService', () => {
  let service: GoalsService;
  let prisma: jest.Mocked<PrismaService>;
  let notificationsService: jest.Mocked<NotificationsService>;

  beforeEach(async () => {
    prisma = {
      goal: {
        findMany: jest.fn(),
        findFirst: jest.fn(),
        create: jest.fn(),
        update: jest.fn(),
      },
      $transaction: jest.fn(),
    } as any;

    notificationsService = {
      getPreferences: jest.fn(),
      createNotification: jest.fn(),
      hasNotification: jest.fn(),
    } as any;

    const module: TestingModule = await Test.createTestingModule({
      providers: [GoalsService, PrismaService, NotificationsService, { provide: PrismaService, useValue: prisma }, { provide: NotificationsService, useValue: notificationsService }],
    }).compile();

    service = module.get<GoalsService>(GoalsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('findOne should throw NotFoundException for missing goal', async () => {
    prisma.goal.findFirst.mockResolvedValue(null);
    await expect(service.findOne('missing', '1')).rejects.toThrow('Goal not found');
  });

  it('addProgress should reject negative amount', async () => {
    prisma.goal.findFirst.mockResolvedValue({ id: '1', userId: '1', isActive: true } as any);
    await expect(service.addProgress('1', '1', -1)).rejects.toThrow('Progress amount must be positive');
  });
});