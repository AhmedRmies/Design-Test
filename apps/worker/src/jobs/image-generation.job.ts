import { Job } from 'bullmq';
import OpenAI from 'openai';
import sharp from 'sharp';
import { prisma } from '@designai/db';
import { uploadBuffer } from '../lib/storage';
import { buildPrompt } from '../lib/prompt';

export interface ImageGenerationJobData {
  generationId: string;
  userId: string;
  prompt: string;
  style: string;
  transparentBackground: boolean;
  enhancePrompt: boolean;
}

const apiKey = process.env.OPENAI_API_KEY;
const openai = apiKey ? new OpenAI({ apiKey }) : undefined;
const MODEL = process.env.OPENAI_IMAGE_MODEL ?? 'gpt-image-1';

export async function processImageGeneration(job: Job<ImageGenerationJobData>) {
  const { generationId, prompt, style, transparentBackground, enhancePrompt } = job.data;

  const setStatus = (status: string, data: Record<string, unknown> = {}) =>
    prisma.generation.update({ where: { id: generationId }, data: { status: status as any, ...data } });

  try {
    if (!openai) throw new Error('OPENAI_API_KEY is not configured');

    await setStatus('GENERATING');

    const finalPrompt = enhancePrompt
      ? await buildPrompt(prompt, style, transparentBackground, openai)
      : await buildPrompt(prompt, style, transparentBackground);

    await prisma.generation.update({
      where: { id: generationId },
      data: { enhancedPrompt: finalPrompt, model: MODEL },
    });

    const response = await openai.images.generate({
      model: MODEL,
      prompt: finalPrompt,
      n: 1,
      size: '1024x1024',
      ...(MODEL === 'gpt-image-1'
        ? { background: transparentBackground ? 'transparent' : 'opaque', quality: 'high' }
        : { response_format: 'b64_json' }),
    } as any);

    const b64 = response.data?.[0]?.b64_json;
    if (!b64) throw new Error('Provider returned no image data');

    await setStatus('POSTPROCESSING');

    // Normalise to a trimmed, print-friendly PNG.
    const processed = await sharp(Buffer.from(b64, 'base64'))
      .trim({ threshold: 10 })
      .resize(2048, 2048, { fit: 'inside', withoutEnlargement: false })
      .png({ compressionLevel: 9 })
      .toBuffer();

    const imageUrl = await uploadBuffer(processed, 'generations');

    await setStatus('COMPLETED', { imageUrl, completedAt: new Date() });
    return { imageUrl };
  } catch (error) {
    const message = (error as Error).message;
    console.error(`[image-generation] ${generationId} failed:`, message);

    await setStatus('FAILED', { error: message, completedAt: new Date() });

    // Refund the credit so the user is not charged for our failure.
    await prisma.user.update({
      where: { id: job.data.userId },
      data: { credits: { increment: 1 } },
    });

    throw error;
  }
}
