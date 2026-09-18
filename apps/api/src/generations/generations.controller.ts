import { Controller, Get, Param, Post, Body, Query, UseGuards, Sse } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { interval, map, switchMap, takeWhile, Observable } from 'rxjs';
import { GenerationsService } from './generations.service';
import { CreateGenerationDto } from './dto/create-generation.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';

@ApiTags('generations')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('generations')
export class GenerationsController {
  constructor(private generations: GenerationsService) {}

  @Post()
  create(@CurrentUser('id') userId: string, @Body() dto: CreateGenerationDto) {
    return this.generations.enqueue(userId, dto);
  }

  @Get()
  list(
    @CurrentUser('id') userId: string,
    @Query('page') page = '1',
    @Query('pageSize') pageSize = '20',
  ) {
    return this.generations.listForUser(userId, Number(page), Number(pageSize));
  }

  @Get(':id')
  findOne(@CurrentUser('id') userId: string, @Param('id') id: string) {
    return this.generations.findOne(userId, id);
  }

  /** Server-sent events stream so the client can show live progress. */
  @Sse(':id/stream')
  stream(@CurrentUser('id') userId: string, @Param('id') id: string): Observable<MessageEvent> {
    return interval(1500).pipe(
      switchMap(() => this.generations.findOne(userId, id)),
      takeWhile((g) => !['COMPLETED', 'FAILED', 'REJECTED'].includes(g.status), true),
      map((g) => ({ data: g }) as MessageEvent),
    );
  }
}
