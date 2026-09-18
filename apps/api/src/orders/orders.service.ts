import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateOrderDto } from './dto/create-order.dto';

const SHIPPING_FLAT_RATE = 4.99;

@Injectable()
export class OrdersService {
  constructor(private prisma: PrismaService) {}

  async create(buyerId: string, dto: CreateOrderDto) {
    const productIds = dto.items.map((i) => i.productId);
    const products = await this.prisma.product.findMany({
      where: { id: { in: productIds }, status: 'PUBLISHED' },
      include: { seller: true, design: true },
    });

    if (products.length !== productIds.length) {
      throw new BadRequestException('One or more products are unavailable');
    }

    const priceMap = new Map(products.map((p) => [p.id, p]));
    let subtotal = 0;

    const items = dto.items.map((item) => {
      const product = priceMap.get(item.productId)!;
      const lineTotal = product.price * item.quantity;
      subtotal += lineTotal;
      return {
        productId: product.id,
        sellerId: product.sellerId,
        size: item.size,
        colorHex: item.colorHex,
        quantity: item.quantity,
        unitPrice: product.price,
        sellerEarned: lineTotal * (1 - product.seller.commission),
        printFileUrl: product.design.printFileUrl,
      };
    });

    const total = subtotal + SHIPPING_FLAT_RATE;

    return this.prisma.order.create({
      data: {
        buyerId,
        orderNumber: `DA-${Date.now().toString(36).toUpperCase()}`,
        subtotal,
        shippingCost: SHIPPING_FLAT_RATE,
        total,
        shippingAddress: dto.shippingAddress as unknown as object,
        items: { createMany: { data: items } },
      },
      include: { items: true },
    });
  }

  async listForBuyer(buyerId: string) {
    return this.prisma.order.findMany({
      where: { buyerId },
      orderBy: { createdAt: 'desc' },
      include: { items: { include: { product: { select: { title: true, slug: true } } } } },
    });
  }

  async findOne(id: string, buyerId: string) {
    const order = await this.prisma.order.findFirst({
      where: { id, buyerId },
      include: { items: { include: { product: true } } },
    });
    if (!order) throw new NotFoundException('Order not found');
    return order;
  }
}
