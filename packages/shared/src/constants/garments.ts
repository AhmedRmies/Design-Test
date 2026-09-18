/** Print area expressed in UV space (0..1) plus physical size for print-file export. */
export interface PrintAreaSpec {
  name: 'front' | 'back' | 'leftSleeve' | 'rightSleeve';
  uv: { x: number; y: number; width: number; height: number };
  widthMm: number;
  heightMm: number;
  maxDpi: number;
}

export interface GarmentSpec {
  slug: string;
  label: string;
  modelUrl: string;
  materialName: string;
  meshName: string;
  basePrice: number;
  printAreas: PrintAreaSpec[];
}

export const DEFAULT_GARMENTS: GarmentSpec[] = [
  {
    slug: 'classic-tee',
    label: 'Classic T-Shirt',
    modelUrl: '/models/classic-tee.glb',
    materialName: 'fabric',
    meshName: 'Shirt',
    basePrice: 19.99,
    printAreas: [
      {
        name: 'front',
        uv: { x: 0.28, y: 0.3, width: 0.44, height: 0.44 },
        widthMm: 300,
        heightMm: 400,
        maxDpi: 300,
      },
      {
        name: 'back',
        uv: { x: 0.28, y: 0.3, width: 0.44, height: 0.44 },
        widthMm: 300,
        heightMm: 400,
        maxDpi: 300,
      },
    ],
  },
];

export const GARMENT_COLORS = [
  { name: 'White', hex: '#FFFFFF' },
  { name: 'Black', hex: '#111111' },
  { name: 'Navy', hex: '#1F2A44' },
  { name: 'Heather Grey', hex: '#B8B8B8' },
  { name: 'Sand', hex: '#D9CBB3' },
  { name: 'Forest', hex: '#2F4F3E' },
] as const;

export const GARMENT_SIZES = ['XS', 'S', 'M', 'L', 'XL', 'XXL'] as const;
