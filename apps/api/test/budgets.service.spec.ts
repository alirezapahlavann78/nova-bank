import { Test, TestingModule } from '@nestjs/testing';
import { BudgetsService } from '../src/budgets/budgets.service';
import { PrismaService } from '../src/prisma/prisma.service';
import { NotificationsService } from '../src/notifications/notifications.service';

describe('BudgetsService', () => {
  let service: BudgetsService;
  let prisma: jest.Mocked<PrismaService>;
  let notificationsService: jest.Mocked<NotificationsService>;

  beforeEach(async () => {
    prisma = {
      budget: {
        findMany: jest.fn(),
        findFirst: jest.fn(),
        create: jest.fn(),
        update: jest.fn(),
      },
      transaction: {
        aggregate: jest.fn(),
      },
      category: {
        findFirst: jest.fn(),
        findMany: jest.fn(),
      },
    } as any;

    notificationsService = {
      getPreferences: jest.fn(),
      createNotification: jest.fn(),
      hasNotification: jest.fn(),
    } as any;

    const module: TestingModule = await Test.createTestingModule({
      providers: [BudgetsService, PrismaService, NotificationsService, { provide: PrismaService, useValue: prisma }, { provide: NotificationsService, useValue: notificationsService }],
    }).compile();

    service = module.get<BudgetsService>(BudgetsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('findOne should throw NotFoundException for missing budget', async () => {
    prisma.budget.findFirst.mockResolvedValue(null);
    await expect(service.findOne('missing', '1')).rejects.toThrow('Budget not found');
  });
});