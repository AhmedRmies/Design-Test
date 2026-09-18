import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class SellersService {
  constructor(private prisma: PrismaService) {}

  private async profileFor(userId: string) {
    const profile = await this.prisma.sellerProfile.findUnique({ where: { userId } });
    if (!profile) throw new NotFoundException('Seller profile not found');
    return profile;
  }

  async publicShop(slug: string) {
    const shop = await this.prisma.sellerProfile.findUnique({
      where: { slug },
      include: {
        products: {
          where: { status: 'PUBLISHED' },
          include: { design: { select: { previewUrl: true } } },
          orderBy: { createdAt: 'desc' },
        },
      },
    });
    if (!shop || shop.status !== 'APPROVED') throw new NotFoundException('Shop not found');
    return shop;
  }

  async publishProduct(
    userId: string,
    dto: { designId: string; title: string; description?: string; price: number },
  ) {
    const profile = await this.profileFor(userId);
    const slug = `${dto.title.toLowerCase().replace(/[^a-z0-9]+/g, '-')}-${Date.now().toString(36)}`;

    return this.prisma.product.create({
      data: {
        sellerId: profile.id,
        designId: dto.designId,
        title: dto.title,
        description: dto.description,
        price: dto.price,
        slug,
        status: 'PENDING_REVIEW',
      },
    });
  }

  async myProducts(userId: string) {
    const profile = await this.profileFor(userId);
    return this.prisma.product.findMany({
      where: { sellerId: profile.id },
      orderBy: { createdAt: 'desc' },
      include: { design: { select: { previewUrl: true } } },
    });
  }

  async dashboard(userId: string) {
    const profile = await this.profileFor(userId);
    const [products, sales, payouts] = await Promise.all([
      this.prisma.product.count({ where: { sellerId: profile.id, status: 'PUBLISHED' } }),
      this.prisma.orderItem.aggregate({
        where: { sellerId: profile.id },
        _sum: { sellerEarned: true, quantity: true },
      }),
      this.prisma.payout.aggregate({
        where: { sellerId: profile.id, status: 'PAID' },
        _sum: { amount: true },
      }),
    ]);

    const earned = sales._sum.sellerEarned ?? 0;
    const paidOut = payouts._sum.amount ?? 0;

    return {
      shopName: profile.shopName,
      status: profile.status,
      publishedProducts: products,
      unitsSold: sales._sum.quantity ?? 0,
      totalEarned: Number(earned.toFixed(2)),
      paidOut: Number(paidOut.toFixed(2)),
      pendingBalance: Number((earned - paidOut).toFixed(2)),
    };
  }
}
