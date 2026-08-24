import { Test, TestingModule } from '@nestjs/testing';
import { AuthController } from '../src/auth/auth.controller';
import { AuthService } from '../src/auth/auth.service';

describe('AuthController', () => {
  let controller: AuthController;
  let authService: jest.Mocked<AuthService>;

  beforeEach(async () => {
    authService = {
      register: jest.fn(),
      login: jest.fn(),
      refresh: jest.fn(),
      logout: jest.fn(),
    } as any;

    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [{ provide: AuthService, useValue: authService }],
    }).compile();

    controller = module.get<AuthController>(AuthController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('register should call authService.register', async () => {
    authService.register.mockResolvedValue({
      user: { id: '1', phone: '09123456789', locale: 'fa-IR', timezone: 'Asia/Tehran' },
      accessToken: 'access',
      refreshToken: 'refresh',
    });
    const result = await controller.register({ phone: '09123456789', password: 'password123' } as any);
    expect(authService.register).toHaveBeenCalledWith({ phone: '09123456789', password: 'password123' });
    expect(result.accessToken).toBe('access');
  });

  it('login should call authService.login', async () => {
    authService.login.mockResolvedValue({
      user: { id: '1', phone: '09123456789', locale: 'fa-IR', timezone: 'Asia/Tehran' },
      accessToken: 'access',
      refreshToken: 'refresh',
    });
    const result = await controller.login({ phone: '09123456789', password: 'password123' } as any);
    expect(authService.login).toHaveBeenCalledWith({ phone: '09123456789', password: 'password123' });
    expect(result.accessToken).toBe('access');
  });
});
