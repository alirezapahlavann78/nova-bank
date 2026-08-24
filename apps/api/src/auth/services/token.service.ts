import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as crypto from 'crypto';

@Injectable()
export class TokenService {
  constructor(private readonly jwtService: JwtService) {}

  generateAccessToken(userId: string): Promise<string> {
    return this.jwtService.signAsync({ sub: userId });
  }

  generateRefreshToken(): string {
    return crypto.randomBytes(64).toString('hex');
  }

  async hashRefreshToken(token: string): Promise<string> {
    return crypto.createHash('sha256').update(token).digest('hex');
  }

  verifyAccessToken(token: string): any {
    try {
      return this.jwtService.verify(token);
    } catch {
      return null;
    }
  }
}
