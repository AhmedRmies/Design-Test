import { ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { StorageService } from '../storage/storage.service';
import { CreateDesignDto, UpdateDesignDto } from './dto/design.dto';

@Injectable()
export class DesignsService {
  constructor(
    private prisma: PrismaService,
    private storage: StorageService,
  ) {}

  async create(userId: string, dto: CreateDesignDto) {
    const garment = await this.prisma.garment.findUnique({ where: { slug: dto.garmentSlug } });
    if (!garment) throw new NotFoundException('Garment not found');

    const previewUrl = dto.previewDataUrl
      ? await this.storage.uploadDataUrl(dto.previewDataUrl, 'previews')
      : null;

    return this.prisma.design.create({
      data: {
        ownerId: userId,
        garmentId: garment.id,
        name: dto.name,
        colorHex: dto.colorHex,
        layers: dto.layers as object,
        previewUrl,
        visibility: dto.visibility ?? 'PRIVATE',
      },
    });
  }

  async listForUser(userId: string, page = 1, pageSize = 24) {
    const [items, total] = await Promise.all([
      this.prisma.design.findMany({
        where: { ownerId: userId },
        orderBy: { updatedAt: 'desc' },
        skip: (page - 1) * pageSize,
        take: pageSize,
        include: { garment: { select: { slug: true, label: true } } },
      }),
      this.prisma.design.count({ where: { ownerId: userId } }),
    ]);
    return { items, total, page, pageSize, hasMore: page * pageSize < total };
  }

  async findOne(id: string, userId?: string) {
    const design = await this.prisma.design.findUnique({
      where: { id },
      include: { garment: { include: { printAreas: true } } },
    });
    if (!design) throw new NotFoundException('Design not found');
    if (design.visibility === 'PRIVATE' && design.ownerId !== userId) {
      throw new ForbiddenException('This design is private');
    }
    return design;
  }

  async update(id: string, userId: string, dto: UpdateDesignDto) {
    await this.assertOwner(id, userId);
    const previewUrl = dto.previewDataUrl
      ? await this.storage.uploadDataUrl(dto.previewDataUrl, 'previews')
      : undefined;

    return this.prisma.design.update({
      where: { id },
      data: {
        name: dto.name,
        colorHex: dto.colorHex,
        layers: dto.layers as object | undefined,
        visibility: dto.visibility,
        ...(previewUrl ? { previewUrl } : {}),
        version: { increment: 1 },
      },
    });
  }

  async duplicate(id: string, userId: string) {
    const original = await this.findOne(id, userId);
    return this.prisma.design.create({
      data: {
        ownerId: userId,
        garmentId: original.garmentId,
        name: `${original.name} (copy)`,
        colorHex: original.colorHex,
        layers: original.layers as object,
        previewUrl: original.previewUrl,
      },
    });
  }

  async remove(id: string, userId: string) {
    await this.assertOwner(id, userId);
    await this.prisma.design.delete({ where: { id } });
    return { success: true };
  }

  private async assertOwner(id: string, userId: string) {
    const design = await this.prisma.design.findUnique({
      where: { id },
      select: { ownerId: true },
    });
    if (!design) throw new NotFoundException('Design not found');
    if (design.ownerId !== userId) throw new ForbiddenException('You do not own this design');
  }
}
