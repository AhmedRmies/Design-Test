import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { DesignsService } from './designs.service';
import { CreateDesignDto, UpdateDesignDto } from './dto/design.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';

@ApiTags('designs')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('designs')
export class DesignsController {
  constructor(private designs: DesignsService) {}

  @Post()
  create(@CurrentUser('id') userId: string, @Body() dto: CreateDesignDto) {
    return this.designs.create(userId, dto);
  }

  @Get()
  list(
    @CurrentUser('id') userId: string,
    @Query('page') page = '1',
    @Query('pageSize') pageSize = '24',
  ) {
    return this.designs.listForUser(userId, Number(page), Number(pageSize));
  }

  @Get(':id')
  findOne(@CurrentUser('id') userId: string, @Param('id') id: string) {
    return this.designs.findOne(id, userId);
  }

  @Patch(':id')
  update(
    @CurrentUser('id') userId: string,
    @Param('id') id: string,
    @Body() dto: UpdateDesignDto,
  ) {
    return this.designs.update(id, userId, dto);
  }

  @Post(':id/duplicate')
  duplicate(@CurrentUser('id') userId: string, @Param('id') id: string) {
    return this.designs.duplicate(id, userId);
  }

  @Delete(':id')
  remove(@CurrentUser('id') userId: string, @Param('id') id: string) {
    return this.designs.remove(id, userId);
  }
}
