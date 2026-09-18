import { Global, Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bullmq';
import { ConfigModule, ConfigService } from '@nestjs/config';
import {
  QUEUE_EMAIL,
  QUEUE_FULFILLMENT,
  QUEUE_IMAGE_GENERATION,
  QUEUE_PRINT_FILE,
} from './queue.constants';

@Global()
@Module({
  imports: [
    BullModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => {
        const url = new URL(config.get('REDIS_URL') ?? 'redis://localhost:6379');
        return {
          connection: {
            host: url.hostname,
            port: Number(url.port || 6379),
            password: url.password || undefined,
          },
          defaultJobOptions: {
            attempts: 3,
            backoff: { type: 'exponential', delay: 2000 },
            removeOnComplete: 1000,
            removeOnFail: 5000,
          },
        };
      },
    }),
    BullModule.registerQueue(
      { name: QUEUE_IMAGE_GENERATION },
      { name: QUEUE_PRINT_FILE },
      { name: QUEUE_FULFILLMENT },
      { name: QUEUE_EMAIL },
    ),
  ],
  exports: [BullModule],
})
export class QueueModule {}
