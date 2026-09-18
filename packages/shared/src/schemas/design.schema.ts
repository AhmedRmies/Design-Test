import { z } from 'zod';

export const layerSchema = z.discriminatedUnion('type', [
  z.object({
    id: z.string(),
    type: z.literal('image'),
    src: z.string(),
    x: z.number(),
    y: z.number(),
    width: z.number(),
    height: z.number(),
    rotation: z.number().default(0),
    opacity: z.number().min(0).max(1).default(1),
  }),
  z.object({
    id: z.string(),
    type: z.literal('text'),
    text: z.string().max(120),
    fontFamily: z.string().default('Inter'),
    fontSize: z.number().default(48),
    fill: z.string().default('#000000'),
    x: z.number(),
    y: z.number(),
    rotation: z.number().default(0),
    curve: z.number().default(0),
  }),
]);

export const designSchema = z.object({
  name: z.string().min(1).max(80).default('Untitled design'),
  garmentSlug: z.string(),
  colorHex: z.string().regex(/^#([0-9a-fA-F]{6})$/),
  areas: z.record(z.string(), z.array(layerSchema)),
  visibility: z.enum(['PRIVATE', 'UNLISTED', 'PUBLIC']).default('PRIVATE'),
});

export type Layer = z.infer<typeof layerSchema>;
export type DesignDocument = z.infer<typeof designSchema>;
