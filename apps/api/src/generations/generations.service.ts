import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';
import { PrismaService } from '../prisma/prisma.service';
import { UsersService } from '../users/users.service';
import { ModerationService } from './moderation.service';
import { QUEUE_IMAGE_GENERATION, ImageGenerationJob } from '../queue/queue.constants';
import { CreateGenerationDto } from './dto/create-generation.dto';

@Injectable()
export class GenerationsService {
  constructor(
    private prisma: PrismaService,
    private users: UsersService,
    private moderation: ModerationService,
    @InjectQueue(QUEUE_IMAGE_GENERATION) private queue: Queue<ImageGenerationJob>,
  ) {}

  /**
   * Enqueues an image generation. Never calls the AI provider inline — the HTTP
   * request returns immediately with a generation id the client subscribes to.
   */
  async enqueue(userId: string, dto: CreateGenerationDto) {
    const flagged = await this.moderation.isPromptUnsafe(dto.prompt);
    if (flagged) {
      throw new BadRequestException('That prompt violates our content policy.');
    }

    const hasCredits = await this.users.consumeCredits(userId, 1);
    if (!hasCredits) {
      throw new BadRequestException('You are out of generation credits.');
    }

    const generation = await this.prisma.generation.create({
      data: {
        userId,
        prompt: dto.prompt,
        style: dto.style ?? 'vector',
        status: 'QUEUED',
      },
    });

    const job = await this.queue.add('generate', {
      generationId: generation.id,
      userId,
      prompt: dto.prompt,
      style: dto.style ?? 'vector',
      transparentBackground: dto.transparentBackground ?? true,
      enhancePrompt: dto.enhancePrompt ?? true,
    });

    await this.prisma.generation.update({
      where: { id: generation.id },
      data: { jobId: String(job.id) },
    });

    return { id: generation.id, status: generation.status };
  }

  async findOne(userId: string, id: string) {
    const generation = await this.prisma.generation.findFirst({ where: { id, userId } });
    if (!generation) throw new NotFoundException('Generation not found');
    return generation;
  }

  async listForUser(userId: string, page = 1, pageSize = 20) {
    const [items, total] = await Promise.all([
      this.prisma.generation.findMany({
        where: { userId },
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * pageSize,
        take: pageSize,
      }),
      this.prisma.generation.count({ where: { userId } }),
    ]);
    return { items, total, page, pageSize, hasMore: page * pageSize < total };
  }
}
