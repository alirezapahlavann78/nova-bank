import { Test, TestingModule } from '@nestjs/testing';
import { GoalsController } from '../src/goals/goals.controller';
import { GoalsService } from '../src/goals/goals.service';
import { PrismaService } from '../src/prisma/prisma.service';

describe('GoalsController', () => {
  let controller: GoalsController;
  let service: jest.Mocked<GoalsService>;

  beforeEach(async () => {
    service = {
      findAll: jest.fn(),
      findOne: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      remove: jest.fn(),
      addProgress: jest.fn(),
    } as any;

    const module: TestingModule = await Test.createTestingModule({
      controllers: [GoalsController],
      providers: [GoalsService, PrismaService, { provide: GoalsService, useValue: service }],
    }).compile();

    controller = module.get<GoalsController>(GoalsController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('addProgress should call service', async () => {
    service.addProgress.mockResolvedValue({ id: '1', currentAmount: 1000 } as any);
    const req = { user: { id: '1' } } as any;
    const result = await controller.addProgress(req, '1', { amount: 1000 });
    expect(service.addProgress).toHaveBeenCalledWith('1', '1', 1000);
  });
});