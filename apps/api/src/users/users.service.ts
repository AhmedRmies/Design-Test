import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}

  async findById(id: string) {
    const user = await this.prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        credits: true,
        avatarUrl: true,
        createdAt: true,
        sellerProfile: { select: { slug: true, shopName: true, status: true } },
      },
    });
    if (!user) throw new NotFoundException('User not found');
    return user;
  }

  async updateProfile(id: string, data: { name?: string; avatarUrl?: string }) {
    return this.prisma.user.update({
      where: { id },
      data,
      select: { id: true, name: true, avatarUrl: true },
    });
  }

  async consumeCredits(userId: string, amount = 1) {
    const result = await this.prisma.user.updateMany({
      where: { id: userId, credits: { gte: amount } },
      data: { credits: { decrement: amount } },
    });
    return result.count > 0;
  }

  async addCredits(userId: string, amount: number) {
    return this.prisma.user.update({
      where: { id: userId },
      data: { credits: { increment: amount } },
      select: { credits: true },
    });
  }
}
