import { z } from 'zod';
import { GARMENT_SIZES } from '../constants/garments';

export const addressSchema = z.object({
  fullName: z.string().min(2),
  line1: z.string().min(3),
  line2: z.string().optional(),
  city: z.string().min(2),
  region: z.string().optional(),
  postalCode: z.string().min(2),
  country: z.string().length(2),
  phone: z.string().optional(),
});

export const cartItemSchema = z.object({
  productId: z.string(),
  size: z.enum(GARMENT_SIZES),
  colorHex: z.string(),
  quantity: z.number().int().min(1).max(20),
});

export const createOrderSchema = z.object({
  items: z.array(cartItemSchema).min(1),
  shippingAddress: addressSchema,
});

export const ORDER_STATUSES = [
  'PENDING',
  'PAID',
  'IN_PRODUCTION',
  'SHIPPED',
  'DELIVERED',
  'CANCELLED',
  'REFUNDED',
] as const;

export type Address = z.infer<typeof addressSchema>;
export type CartItem = z.infer<typeof cartItemSchema>;
export type CreateOrderInput = z.infer<typeof createOrderSchema>;
export type OrderStatus = (typeof ORDER_STATUSES)[number];
