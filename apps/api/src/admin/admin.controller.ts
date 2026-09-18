import { Body, Controller, Get, Param, Patch, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { IsBoolean, IsInt, Min } from 'class-validator';
import { AdminService } from './admin.service';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { CurrentUser } from '../common/decorators/current-user.decorator';

class ReviewDto {
  @IsBoolean() approve!: boolean;
}
class BanDto {
  @IsBoolean() isBanned!: boolean;
}
class CreditsDto {
  @IsInt() @Min(1) amount!: number;
}

@ApiTags('admin')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('ADMIN')
@Controller('admin')
export class AdminController {
  constructor(private admin: AdminService) {}

  @Get('stats')
  stats() {
    return this.admin.stats();
  }

  @Get('moderation')
  moderation() {
    return this.admin.moderationQueue();
  }

  @Get('products/pending')
  pending() {
    return this.admin.pendingProducts();
  }

  @Patch('products/:id/review')
  review(@Param('id') id: string, @Body() dto: ReviewDto, @CurrentUser('id') actorId: string) {
    return this.admin.reviewProduct(id, dto.approve, actorId);
  }

  @Patch('users/:id/ban')
  ban(@Param('id') id: string, @Body() dto: BanDto, @CurrentUser('id') actorId: string) {
    return this.admin.setUserBan(id, dto.isBanned, actorId);
  }

  @Patch('users/:id/credits')
  credits(@Param('id') id: string, @Body() dto: CreditsDto, @CurrentUser('id') actorId: string) {
    return this.admin.grantCredits(id, dto.amount, actorId);
  }
}
