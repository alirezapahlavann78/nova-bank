import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class UsersService {
  constructor(private readonly prisma: PrismaService) {}

  async create(data: {
    phone: string;
    email?: string;
    passwordHash: string;
    firstName?: string;
    lastName?: string;
    locale?: string;
    timezone?: string;
    deviceId?: string;
    platform?: string;
    deviceName?: string;
  }) {
    return this.prisma.user.create({
      data: {
        phone: data.phone,
        email: data.email,
        password: data.passwordHash,
        firstName: data.firstName,
        lastName: data.lastName,
        locale: data.locale,
        timezone: data.timezone,
        devices: data.deviceId
          ? {
              create: {
                deviceId: data.deviceId,
                platform: data.platform || 'unknown',
                name: data.deviceName,
              },
            }
          : undefined,
      },
      select: {
        id: true,
        phone: true,
        email: true,
        firstName: true,
        lastName: true,
        locale: true,
        timezone: true,
        createdAt: true,
        updatedAt: true,
      },
    });
  }

  async findById(id: string) {
    const user = await this.prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        phone: true,
        email: true,
        firstName: true,
        lastName: true,
        locale: true,
        timezone: true,
        createdAt: true,
        updatedAt: true,
      },
    });
    if (!user) {
      throw new NotFoundException('User not found');
    }
    return user;
  }

  async findByPhone(phone: string) {
    return this.prisma.user.findUnique({
      where: { phone },
    });
  }

  async updateProfile(userId: string, dto: { firstName?: string; lastName?: string; locale?: string; timezone?: string }) {
    return this.prisma.user.update({
      where: { id: userId },
      data: dto,
      select: {
        id: true,
        phone: true,
        email: true,
        firstName: true,
        lastName: true,
        locale: true,
        timezone: true,
        createdAt: true,
        updatedAt: true,
      },
    });
  }
}
