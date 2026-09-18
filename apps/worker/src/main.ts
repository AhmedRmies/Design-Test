import 'dotenv/config';
import { Worker, QueueEvents } from 'bullmq';
import { redisConnection } from './lib/redis';
import { processImageGeneration } from './jobs/image-generation.job';

const connection = redisConnection();

const imageWorker = new Worker('image-generation', processImageGeneration, {
  connection,
  concurrency: Number(process.env.WORKER_CONCURRENCY ?? 3),
});

const events = new QueueEvents('image-generation', { connection });

imageWorker.on('completed', (job) => console.log(`[worker] completed job ${job.id}`));
imageWorker.on('failed', (job, err) => console.error(`[worker] failed job ${job?.id}:`, err.message));
events.on('waiting', ({ jobId }) => console.log(`[worker] queued job ${jobId}`));

console.log('Design AI worker started. Listening on queue: image-generation');

const shutdown = async () => {
  console.log('Shutting down worker...');
  await imageWorker.close();
  await events.close();
  process.exit(0);
};
process.on('SIGTERM', shutdown);
process.on('SIGINT', shutdown);
