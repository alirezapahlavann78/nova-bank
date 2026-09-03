import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { NotificationsService } from '../notifications/notifications.service';
import { CreateGoalDto } from './dto/create-goal.dto';
import { UpdateGoalDto } from './dto/update-goal.dto';

@Injectable()
export class GoalsService {
  constructor(private readonly prisma: PrismaService, private readonly notificationsService: NotificationsService) {}

  async findAll(userId: string) {
    const goals = await this.prisma.goal.findMany({
      where: { userId, isActive: true },
      orderBy: { createdAt: 'desc' },
    });

    return goals.map((goal: any) => this.mapGoal(goal));
  }

  async findAllByType(userId: string, goalType: string) {
    const goals = await this.prisma.goal.findMany({
      where: { userId, isActive: true, goalType: goalType as any },
      orderBy: { createdAt: 'desc' },
    });

    return goals.map((goal: any) => this.mapGoal(goal));
  }

  async findOne(id: string, userId: string) {
    const goal = await this.prisma.goal.findFirst({ where: { id, userId } });
    if (!goal) throw new NotFoundException('Goal not found');
    return this.mapGoal(goal);
  }

  async create(userId: string, dto: CreateGoalDto) {
    const targetDate = new Date(dto.targetDate);
    return this.prisma.goal.create({
      data: {
        userId,
        name: dto.name,
        description: dto.description,
        targetAmount: dto.targetAmount,
        currency: dto.currency as any,
        targetDate,
        goalType: dto.goalType as any,
      },
    });
  }

  async update(id: string, userId: string, dto: UpdateGoalDto) {
    const goal = await this.prisma.goal.findFirst({ where: { id, userId } });
    if (!goal) throw new NotFoundException('Goal not found');

    const data: any = {};
    if (dto.name !== undefined) data.name = dto.name;
    if (dto.description !== undefined) data.description = dto.description;
    if (dto.targetAmount !== undefined) data.targetAmount = dto.targetAmount;
    if (dto.targetDate !== undefined) data.targetDate = new Date(dto.targetDate);
    if (dto.isActive !== undefined) data.isActive = dto.isActive;
    if (dto.goalType !== undefined) data.goalType = dto.goalType;

    return this.prisma.goal.update({ where: { id }, data });
  }

  async remove(id: string, userId: string) {
    const goal = await this.prisma.goal.findFirst({ where: { id, userId } });
    if (!goal) throw new NotFoundException('Goal not found');

    await this.prisma.goal.update({ where: { id }, data: { isActive: false } });
    return { success: true };
  }

  async addProgress(id: string, userId: string, amount: number) {
    const goal = await this.prisma.goal.findFirst({ where: { id, userId, isActive: true } });
    if (!goal) throw new NotFoundException('Goal not found');

    if (amount <= 0) {
      throw new BadRequestException('Progress amount must be positive');
    }

    return this.prisma.$transaction(async (tx: any) => {
      const updated = await tx.goal.update({
        where: { id },
        data: {
          currentAmount: { increment: amount },
          isCompleted: goal.currentAmount + amount >= goal.targetAmount,
        },
      });

      await this.checkGoalMilestones(userId, updated);

      return this.mapGoal(updated);
    });
  }

  private async checkGoalMilestones(userId: string, goal: any) {
    const preferences = await this.notificationsService.getPreferences(userId);
    if (!preferences.goalAlerts) return;

    const percentage = goal.targetAmount > 0 ? (goal.currentAmount / goal.targetAmount) * 100 : 0;

    if (percentage >= 100 && !goal.isCompleted) {
      const hasCompleted = await this.notificationsService.hasNotification(userId, 'GOAL_COMPLETED', 'goalId', goal.id);
      if (!hasCompleted) {
        await this.notificationsService.createNotification(
          userId,
          'GOAL_COMPLETED',
          'هدف تکمیل شد',
          `تبریک! هدف "${goal.name}" با موفقیت تکمیل شد.`,
          { goalId: goal.id },
        );
      }
      return;
    }

    const milestones = [25, 50, 75];
    for (const milestone of milestones) {
      if (percentage >= milestone) {
        const hasMilestone = await this.notificationsService.hasNotification(userId, 'GOAL_MILESTONE', 'milestone', String(milestone));
        if (!hasMilestone) {
          await this.notificationsService.createNotification(
            userId,
            'GOAL_MILESTONE',
            'مرحله جدید',
            `شما ${milestone}% از هدف "${goal.name}" را تکمیل کردید.`,
            { goalId: goal.id, milestone },
          );
        }
      }
    }
  }

  private mapGoal(goal: any) {
    const remaining = goal.targetAmount - goal.currentAmount;
    const percentageComplete = goal.targetAmount > 0 ? (goal.currentAmount / goal.targetAmount) * 100 : 0;
    return {
      id: goal.id,
      userId: goal.userId,
      name: goal.name,
      description: goal.description,
      targetAmount: goal.targetAmount,
      currentAmount: goal.currentAmount,
      remaining,
      percentageComplete,
      currency: goal.currency,
      targetDate: goal.targetDate.toISOString(),
      isCompleted: goal.isCompleted,
      isActive: goal.isActive,
      goalType: goal.goalType,
      createdAt: goal.createdAt.toISOString(),
      updatedAt: goal.updatedAt.toISOString(),
    };
  }
}