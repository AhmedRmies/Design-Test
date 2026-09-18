import { PrismaClient, Role } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

const COLORS = [
  { name: 'White', hex: '#FFFFFF' },
  { name: 'Black', hex: '#111111' },
  { name: 'Navy', hex: '#1F2A44' },
  { name: 'Heather Grey', hex: '#B8B8B8' },
  { name: 'Sand', hex: '#D9CBB3' },
  { name: 'Forest', hex: '#2F4F3E' },
];
const SIZES = ['XS', 'S', 'M', 'L', 'XL', 'XXL'];

const GARMENTS = [
  { slug: 'classic-tee', label: 'Classic T-Shirt', basePrice: 19.99, modelUrl: '/models/classic-tee.glb' },
  { slug: 'long-sleeve', label: 'Long Sleeve Tee', basePrice: 24.99, modelUrl: '/models/long-sleeve.glb' },
  { slug: 'hoodie', label: 'Pullover Hoodie', basePrice: 39.99, modelUrl: '/models/hoodie.glb' },
  { slug: 'oversized-tee', label: 'Oversized Tee', basePrice: 22.99, modelUrl: '/models/oversized-tee.glb' },
  { slug: 'tote-bag', label: 'Canvas Tote Bag', basePrice: 14.99, modelUrl: '/models/tote-bag.glb' },
];

async function main() {
  console.log('Seeding database...');

  const password = await bcrypt.hash('Password123!', 10);

  const admin = await prisma.user.upsert({
    where: { email: 'admin@designai.app' },
    update: {},
    create: {
      email: 'admin@designai.app',
      name: 'Platform Admin',
      passwordHash: password,
      role: Role.ADMIN,
      credits: 9999,
      emailVerified: true,
    },
  });

  const seller = await prisma.user.upsert({
    where: { email: 'seller@designai.app' },
    update: {},
    create: {
      email: 'seller@designai.app',
      name: 'Demo Seller',
      passwordHash: password,
      role: Role.SELLER,
      credits: 100,
      emailVerified: true,
      sellerProfile: {
        create: {
          shopName: 'Demo Shop',
          slug: 'demo-shop',
          bio: 'AI-generated apparel for the bold.',
          status: 'APPROVED',
        },
      },
    },
  });

  const customer = await prisma.user.upsert({
    where: { email: 'customer@designai.app' },
    update: {},
    create: {
      email: 'customer@designai.app',
      name: 'Demo Customer',
      passwordHash: password,
      role: Role.CUSTOMER,
      credits: 25,
      emailVerified: true,
    },
  });

  for (const g of GARMENTS) {
    const garment = await prisma.garment.upsert({
      where: { slug: g.slug },
      update: {},
      create: {
        slug: g.slug,
        label: g.label,
        modelUrl: g.modelUrl,
        basePrice: g.basePrice,
        description: `${g.label} — 100% combed ring-spun cotton.`,
      },
    });

    for (const area of ['front', 'back'] as const) {
      await prisma.printArea.upsert({
        where: { garmentId_name: { garmentId: garment.id, name: area } },
        update: {},
        create: {
          garmentId: garment.id,
          name: area,
          uvX: 0.28,
          uvY: 0.3,
          uvWidth: 0.44,
          uvHeight: 0.44,
          widthMm: 300,
          heightMm: 400,
        },
      });
    }

    for (const color of COLORS) {
      for (const size of SIZES) {
        const sku = `${g.slug}-${color.name.replace(/\s+/g, '').toLowerCase()}-${size}`.toUpperCase();
        await prisma.garmentVariant.upsert({
          where: { garmentId_colorHex_size: { garmentId: garment.id, colorHex: color.hex, size } },
          update: {},
          create: {
            garmentId: garment.id,
            colorName: color.name,
            colorHex: color.hex,
            size,
            sku,
          },
        });
      }
    }
  }

  console.log('Seed complete.');
  console.log({ admin: admin.email, seller: seller.email, customer: customer.email });
  console.log('All demo passwords: Password123!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
