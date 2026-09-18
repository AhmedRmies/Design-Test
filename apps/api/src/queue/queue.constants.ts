export const QUEUE_IMAGE_GENERATION = 'image-generation';
export const QUEUE_PRINT_FILE = 'print-file';
export const QUEUE_FULFILLMENT = 'fulfillment';
export const QUEUE_EMAIL = 'email';

export interface ImageGenerationJob {
  generationId: string;
  userId: string;
  prompt: string;
  style: string;
  transparentBackground: boolean;
  enhancePrompt: boolean;
}
