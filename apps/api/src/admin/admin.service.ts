import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class AdminService {
  constructor(private prisma: PrismaService) {}

  async stats() {
    const [users, sellers, designs, generations, orders, revenue] = await Promise.all([
      this.prisma.user.count(),
      this.prisma.sellerProfile.count({ where: { status: 'APPROVED' } }),
      this.prisma.design.count(),
      this.prisma.generation.count(),
      this.prisma.order.count({ where: { status: { not: 'PENDING' } } }),
      this.prisma.order.aggregate({
        where: { status: { in: ['PAID', 'IN_PRODUCTION', 'SHIPPED', 'DELIVERED'] } },
        _sum: { total: true },
      }),
    ]);

    return {
      users,
      approvedSellers: sellers,
      designs,
      generations,
      orders,
      revenue: Number((revenue._sum.total ?? 0).toFixed(2)),
    };
  }

  moderationQueue() {
    return this.prisma.report.findMany({
      where: { status: { in: ['OPEN', 'REVIEWING'] } },
      orderBy: { createdAt: 'asc' },
      include: {
        design: { select: { id: true, name: true, previewUrl: true, ownerId: true } },
        reporter: { select: { email: true } },
      },
    });
  }

  pendingProducts() {
    return this.prisma.product.findMany({
      where: { status: 'PENDING_REVIEW' },
      include: {
        design: { select: { previewUrl: true } },
        seller: { select: { shopName: true, slug: true } },
      },
    });
  }

  async reviewProduct(productId: string, approve: boolean, actorId: string) {
    const product = await this.prisma.product.update({
      where: { id: productId },
      data: { status: approve ? 'PUBLISHED' : 'REJECTED' },
    });
    await this.prisma.auditLog.create({
      data: {
        actorId,
        action: approve ? 'product.approved' : 'product.rejected',
        entityType: 'Product',
        entityId: productId,
      },
    });
    return product;
  }

  async setUserBan(userId: string, isBanned: boolean, actorId: string) {
    const user = await this.prisma.user.update({ where: { id: userId }, data: { isBanned } });
    await this.prisma.auditLog.create({
      data: {
        actorId,
        action: isBanned ? 'user.banned' : 'user.unbanned',
        entityType: 'User',
        entityId: userId,
      },
    });
    return { id: user.id, isBanned: user.isBanned };
  }

  async grantCredits(userId: string, amount: number, actorId: string) {
    const user = await this.prisma.user.update({
      where: { id: userId },
      data: { credits: { increment: amount } },
      select: { id: true, credits: true },
    });
    await this.prisma.auditLog.create({
      data: {
        actorId,
        action: 'user.credits_granted',
        entityType: 'User',
        entityId: userId,
        metadata: { amount },
      },
    });
    return user;
  }
}
