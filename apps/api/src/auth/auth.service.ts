import { Injectable, UnauthorizedException, BadRequestException } from '@nestjs/common';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { RefreshDto } from './dto/refresh.dto';
import { PasswordService } from './services/password.service';
import { TokenService } from './services/token.service';
import { SessionService } from './services/session.service';
import { UsersService } from '../users/users.service';

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

export interface AuthResponse {
  user: {
    id: string;
    phone: string;
    email?: string;
    firstName?: string;
    lastName?: string;
    locale: string;
    timezone: string;
  };
  accessToken: string;
  refreshToken: string;
}

function normalizePhone(phone: string): string {
  const persianDigits = /[\u06F0-\u06F9]/g;
  const arabicDigits = /[\u0660-\u0669]/g;
  let normalized = phone
    .replace(persianDigits, (d) => String(d.charCodeAt(0) - 0x06F0))
    .replace(arabicDigits, (d) => String(d.charCodeAt(0) - 0x0660))
    .replace(/[^0-9+]/g, '');

  if (normalized.startsWith('+98')) {
    normalized = '0' + normalized.slice(3);
  } else if (normalized.startsWith('98') && normalized.length === 12) {
    normalized = '0' + normalized.slice(2);
  } else if (normalized.startsWith('0098')) {
    normalized = '0' + normalized.slice(4);
  }

  return normalized;
}

function normalizeEmail(email: string): string {
  return email.trim().toLowerCase();
}

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly passwordService: PasswordService,
    private readonly tokenService: TokenService,
    private readonly sessionService: SessionService,
  ) {}

  async register(dto: RegisterDto): Promise<AuthResponse> {
    const phone = normalizePhone(dto.phone);
    const existing = await this.usersService.findByPhone(phone);
    if (existing) {
      throw new BadRequestException('Phone already registered');
    }

    const passwordHash = await this.passwordService.hash(dto.password);
    const user = await this.usersService.create({
      phone,
      email: dto.email ? normalizeEmail(dto.email) : undefined,
      passwordHash,
      firstName: dto.firstName,
      lastName: dto.lastName,
      locale: dto.locale,
      timezone: dto.timezone,
      deviceId: dto.deviceId,
      platform: dto.platform,
      deviceName: dto.deviceName,
    });

    const tokens = await this.issueTokens(user.id, dto.deviceId);
    return this.buildResponse(user, tokens);
  }

  async login(dto: LoginDto): Promise<AuthResponse> {
    const phone = normalizePhone(dto.phone);
    const user = await this.usersService.findByPhone(phone);
    if (!user || !user.password) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const isValid = await this.passwordService.compare(dto.password, user.password);
    if (!isValid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const tokens = await this.issueTokens(user.id, dto.deviceId);
    return this.buildResponse(user, tokens);
  }

  async refresh(dto: RefreshDto): Promise<AuthResponse> {
    // Rotation issues a brand-new refresh token; the service revokes the old
    // session and returns the fresh token, which the client must persist.
    const rotated = await this.sessionService.rotateRefreshToken(dto.refreshToken);
    const user = await this.usersService.findById(rotated.userId);
    if (!user) {
      throw new UnauthorizedException('Invalid session');
    }
    const accessToken = await this.tokenService.generateAccessToken(user.id);
    return this.buildResponse(user, {
      accessToken,
      refreshToken: rotated.refreshToken,
    });
  }

  async logout(userId: string, sessionId?: string) {
    if (sessionId) {
      await this.sessionService.revokeSession(sessionId, userId);
    }
    return { success: true };
  }

  private async issueTokens(userId: string, deviceId?: string) {
    const [accessToken, refreshToken] = await Promise.all([
      this.tokenService.generateAccessToken(userId),
      this.tokenService.generateRefreshToken(),
    ]);

    const refreshTokenHash = await this.tokenService.hashRefreshToken(refreshToken);
    await this.sessionService.createSession(userId, refreshTokenHash, deviceId);

    return { accessToken, refreshToken };
  }

  private buildResponse(user: any, tokens: AuthTokens): AuthResponse {
    return {
      user: {
        id: user.id,
        phone: user.phone,
        email: user.email ?? undefined,
        firstName: user.firstName ?? undefined,
        lastName: user.lastName ?? undefined,
        locale: user.locale,
        timezone: user.timezone,
      },
      accessToken: tokens.accessToken,
      refreshToken: tokens.refreshToken,
    };
  }
}