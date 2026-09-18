'use client';

import { create } from 'zustand';

export type PrintAreaName = 'front' | 'back';

export interface ImageLayer {
  id: string;
  type: 'image';
  src: string;
  x: number;
  y: number;
  width: number;
  height: number;
  rotation: number;
  opacity: number;
}

export interface TextLayer {
  id: string;
  type: 'text';
  text: string;
  fontFamily: string;
  fontSize: number;
  fill: string;
  x: number;
  y: number;
  rotation: number;
}

export type Layer = ImageLayer | TextLayer;

interface DesignState {
  garmentSlug: string;
  colorHex: string;
  activeArea: PrintAreaName;
  selectedLayerId: string | null;
  areas: Record<PrintAreaName, Layer[]>;

  setGarment: (slug: string) => void;
  setColor: (hex: string) => void;
  setActiveArea: (area: PrintAreaName) => void;
  selectLayer: (id: string | null) => void;
  addLayer: (layer: Layer) => void;
  updateLayer: (id: string, patch: Partial<Layer>) => void;
  removeLayer: (id: string) => void;
  moveLayer: (id: string, direction: 'up' | 'down') => void;
  reset: () => void;
}

const emptyAreas = (): Record<PrintAreaName, Layer[]> => ({ front: [], back: [] });

export const useDesignStore = create<DesignState>((set) => ({
  garmentSlug: 'classic-tee',
  colorHex: '#FFFFFF',
  activeArea: 'front',
  selectedLayerId: null,
  areas: emptyAreas(),

  setGarment: (slug) => set({ garmentSlug: slug }),
  setColor: (hex) => set({ colorHex: hex }),
  setActiveArea: (area) => set({ activeArea: area, selectedLayerId: null }),
  selectLayer: (id) => set({ selectedLayerId: id }),

  addLayer: (layer) =>
    set((s) => ({
      areas: { ...s.areas, [s.activeArea]: [...s.areas[s.activeArea], layer] },
      selectedLayerId: layer.id,
    })),

  updateLayer: (id, patch) =>
    set((s) => ({
      areas: {
        ...s.areas,
        [s.activeArea]: s.areas[s.activeArea].map((l) =>
          l.id === id ? ({ ...l, ...patch } as Layer) : l,
        ),
      },
    })),

  removeLayer: (id) =>
    set((s) => ({
      areas: { ...s.areas, [s.activeArea]: s.areas[s.activeArea].filter((l) => l.id !== id) },
      selectedLayerId: null,
    })),

  moveLayer: (id, direction) =>
    set((s) => {
      const list = [...s.areas[s.activeArea]];
      const i = list.findIndex((l) => l.id === id);
      const j = direction === 'up' ? i + 1 : i - 1;
      if (i < 0 || j < 0 || j >= list.length) return s;
      [list[i], list[j]] = [list[j], list[i]];
      return { areas: { ...s.areas, [s.activeArea]: list } };
    }),

  reset: () => set({ areas: emptyAreas(), colorHex: '#FFFFFF', selectedLayerId: null }),
}));
