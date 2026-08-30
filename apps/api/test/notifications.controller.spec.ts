import { Test, TestingModule } from '@nestjs/testing';
import { NotificationsController } from '../src/notifications/notifications.controller';
import { NotificationsService } from '../src/notifications/notifications.service';
import { PrismaService } from '../src/prisma/prisma.service';

describe('NotificationsController', () => {
  let controller: NotificationsController;
  let service: jest.Mocked<NotificationsService>;

  beforeEach(async () => {
    service = {
      findAll: jest.fn(),
      findOne: jest.fn(),
      markAsRead: jest.fn(),
      markAllAsRead: jest.fn(),
      remove: jest.fn(),
    } as any;

    const module: TestingModule = await Test.createTestingModule({
      controllers: [NotificationsController],
      providers: [NotificationsService, PrismaService, { provide: NotificationsService, useValue: service }],
    }).compile();

    controller = module.get<NotificationsController>(NotificationsController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('findAll should call service', async () => {
    service.findAll.mockResolvedValue({ data: [], page: 1, limit: 20, total: 0, totalPages: 0 } as any);
    const req = { user: { id: '1' } } as any;
    const result = await controller.findAll(req, {});
    expect(service.findAll).toHaveBeenCalledWith('1', {});
  });

  it('markAsRead should call service', async () => {
    service.markAsRead.mockResolvedValue({ id: '1', isRead: true } as any);
    const req = { user: { id: '1' } } as any;
    const result = await controller.markAsRead(req, '1');
    expect(service.markAsRead).toHaveBeenCalledWith('1', '1');
  });

  it('markAllAsRead should call service', async () => {
    service.markAllAsRead.mockResolvedValue({ success: true } as any);
    const req = { user: { id: '1' } } as any;
    const result = await controller.markAllAsRead(req);
    expect(service.markAllAsRead).toHaveBeenCalledWith('1');
  });

  it('remove should call service', async () => {
    service.remove.mockResolvedValue({ success: true } as any);
    const req = { user: { id: '1' } } as any;
    const result = await controller.remove(req, '1');
    expect(service.remove).toHaveBeenCalledWith('1', '1');
  });
});