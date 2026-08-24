import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from '../src/auth/auth.service';
import { PasswordService } from '../src/auth/services/password.service';
import { TokenService } from '../src/auth/services/token.service';
import { SessionService } from '../src/auth/services/session.service';
import { UsersService } from '../src/users/users.service';

describe('AuthService', () => {
  let service: AuthService;
  let passwordService: jest.Mocked<PasswordService>;
  let tokenService: jest.Mocked<TokenService>;
  let sessionService: jest.Mocked<SessionService>;
  let usersService: jest.Mocked<UsersService>;

  beforeEach(async () => {
    passwordService = {
      hash: jest.fn(),
      compare: jest.fn(),
    } as any;
    tokenService = {
      generateAccessToken: jest.fn(),
      generateRefreshToken: jest.fn(),
      hashRefreshToken: jest.fn(),
    } as any;
    sessionService = {
      createSession: jest.fn(),
      findByRefreshTokenHash: jest.fn(),
      revokeSession: jest.fn(),
      rotateRefreshToken: jest.fn(),
    } as any;
    usersService = {
      findByPhone: jest.fn(),
      findById: jest.fn(),
      create: jest.fn(),
    } as any;

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: PasswordService, useValue: passwordService },
        { provide: TokenService, useValue: tokenService },
        { provide: SessionService, useValue: sessionService },
        { provide: UsersService, useValue: usersService },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('register should hash password and create user', async () => {
    passwordService.hash.mockResolvedValue('hashed');
    usersService.create.mockResolvedValue({
      id: '1', phone: '09123456789', locale: 'fa-IR', timezone: 'Asia/Tehran',
    });
    tokenService.generateAccessToken.mockResolvedValue('access');
    tokenService.generateRefreshToken.mockReturnValue('refresh');
    tokenService.hashRefreshToken.mockResolvedValue('hash');
    sessionService.createSession.mockResolvedValue({ id: '1' } as any);

    const result = await service.register({
      phone: '09123456789',
      password: 'password123',
      locale: 'fa-IR',
      timezone: 'Asia/Tehran',
    });

    expect(passwordService.hash).toHaveBeenCalledWith('password123');
    expect(usersService.create).toHaveBeenCalledWith({
      phone: '09123456789',
      email: undefined,
      passwordHash: 'hashed',
      firstName: undefined,
      lastName: undefined,
      locale: 'fa-IR',
      timezone: 'Asia/Tehran',
      deviceId: undefined,
      platform: undefined,
      deviceName: undefined,
    });
    expect(result.accessToken).toBe('access');
    expect(result.refreshToken).toBe('refresh');
  });

  it('login should reject invalid credentials', async () => {
    usersService.findByPhone.mockResolvedValue(null);
    await expect(service.login({ phone: '09123456789', password: 'wrong' })).rejects.toThrow('Invalid credentials');
  });

  it('login should succeed with valid credentials', async () => {
    usersService.findByPhone.mockResolvedValue({ id: '1', password: 'hashed', phone: '09123456789', locale: 'fa-IR', timezone: 'Asia/Tehran' });
    passwordService.compare.mockResolvedValue(true);
    tokenService.generateAccessToken.mockResolvedValue('access');
    tokenService.generateRefreshToken.mockReturnValue('refresh');
    tokenService.hashRefreshToken.mockResolvedValue('hash');
    sessionService.createSession.mockResolvedValue({ id: '1' } as any);

    const result = await service.login({ phone: '09123456789', password: 'correct' });
    expect(result.accessToken).toBe('access');
  });

  it('logout should revoke session', async () => {
    sessionService.revokeSession.mockResolvedValue(undefined as any);
    await expect(service.logout('1', 'session-1')).resolves.toEqual({ success: true });
    expect(sessionService.revokeSession).toHaveBeenCalledWith('session-1', '1');
  });
});
