import { Module } from '@nestjs/common';
import { GenerationsService } from './generations.service';
import { GenerationsController } from './generations.controller';
import { ModerationService } from './moderation.service';
import { UsersModule } from '../users/users.module';

@Module({
  imports: [UsersModule],
  controllers: [GenerationsController],
  providers: [GenerationsService, ModerationService],
  exports: [GenerationsService],
})
export class GenerationsModule {}
