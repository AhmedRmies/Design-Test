import { z } from 'zod';

export const generationRequestSchema = z.object({
  prompt: z.string().min(3).max(500),
  style: z
    .enum(['vector', 'illustration', 'photoreal', 'minimal', 'retro', 'anime'])
    .default('vector'),
  transparentBackground: z.boolean().default(true),
  enhancePrompt: z.boolean().default(true),
});

export const generationStatusSchema = z.enum([
  'QUEUED',
  'MODERATING',
  'GENERATING',
  'POSTPROCESSING',
  'COMPLETED',
  'FAILED',
  'REJECTED',
]);

export const generationSchema = z.object({
  id: z.string(),
  status: generationStatusSchema,
  prompt: z.string(),
  enhancedPrompt: z.string().nullable(),
  imageUrl: z.string().nullable(),
  error: z.string().nullable(),
  createdAt: z.string(),
});

export type GenerationRequest = z.infer<typeof generationRequestSchema>;
export type GenerationStatus = z.infer<typeof generationStatusSchema>;
export type Generation = z.infer<typeof generationSchema>;
