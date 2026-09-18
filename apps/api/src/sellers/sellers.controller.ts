import { Body, Controller, Get, Param, Post, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { IsNumber, IsOptional, IsString, Min } from 'class-validator';
import { SellersService } from './sellers.service';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles, Public } from '../common/decorators/roles.decorator';
import { CurrentUser } from '../common/decorators/current-user.decorator';

class PublishProductDto {
  @IsString() designId!: string;
  @IsString() title!: string;
  @IsOptional() @IsString() description?: string;
  @IsNumber() @Min(1) price!: number;
}

@ApiTags('sellers')
@Controller('sellers')
export class SellersController {
  constructor(private sellers: SellersService) {}

  @Public()
  @Get('shop/:slug')
  shop(@Param('slug') slug: string) {
    return this.sellers.publicShop(slug);
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('SELLER', 'ADMIN')
  @Get('dashboard')
  dashboard(@CurrentUser('id') userId: string) {
    return this.sellers.dashboard(userId);
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('SELLER', 'ADMIN')
  @Get('products')
  products(@CurrentUser('id') userId: string) {
    return this.sellers.myProducts(userId);
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('SELLER', 'ADMIN')
  @Post('products')
  publish(@CurrentUser('id') userId: string, @Body() dto: PublishProductDto) {
    return this.sellers.publishProduct(userId, dto);
  }
}
