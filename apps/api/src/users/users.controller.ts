import { Body, Controller, Get, Patch, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { IsOptional, IsString, MaxLength } from 'class-validator';
import { UsersService } from './users.service';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';

class UpdateProfileDto {
  @IsOptional() @IsString() @MaxLength(60) name?: string;
  @IsOptional() @IsString() avatarUrl?: string;
}

@ApiTags('users')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('users')
export class UsersController {
  constructor(private users: UsersService) {}

  @Get('me')
  me(@CurrentUser('id') id: string) {
    return this.users.findById(id);
  }

  @Patch('me')
  update(@CurrentUser('id') id: string, @Body() dto: UpdateProfileDto) {
    return this.users.updateProfile(id, dto);
  }
}
