'use client';

import dynamic from 'next/dynamic';
import { useState } from 'react';
import toast from 'react-hot-toast';
import { Save, Download } from 'lucide-react';
import { AIPanel } from '@/components/editor/AIPanel';
import { ColorPanel } from '@/components/editor/ColorPanel';
import { TextPanel } from '@/components/editor/TextPanel';
import { LayerPanel } from '@/components/editor/LayerPanel';
import { useDesignStore } from '@/lib/store';
import { exportPrintFile } from '@/lib/design-canvas';
import { api } from '@/lib/api';

// Three.js must never run during SSR.
const Scene = dynamic(() => import('@/components/three/Scene').then((m) => m.Scene), {
  ssr: false,
  loading: () => <div className="canvas-shell h-full w-full animate-pulse" />,
});

const GARMENTS = [
  { slug: 'classic-tee', label: 'Classic Tee', model: '/models/classic-tee.glb' },
];

export default function DesignerPage() {
  const [garment, setGarment] = useState(GARMENTS[0]);
  const [saving, setSaving] = useState(false);
  const { areas, activeArea, setActiveArea, colorHex, setGarment: setSlug } = useDesignStore();

  async function saveDesign() {
    setSaving(true);
    try {
      await api.post('/designs', {
        name: 'Untitled design',
        garmentSlug: garment.slug,
        colorHex,
        layers: areas,
      });
      toast.success('Design saved to your library');
    } catch (err: any) {
      toast.error(err.message ?? 'Could not save — are you signed in?');
    } finally {
      setSaving(false);
    }
  }

  async function downloadPrintFile() {
    const dataUrl = await exportPrintFile(areas[activeArea], 300, 300);
    const a = document.createElement('a');
    a.href = dataUrl;
    a.download = `designai-${activeArea}-300dpi.png`;
    a.click();
  }

  return (
    <main className="flex h-screen flex-col lg:flex-row">
      <div className="relative h-1/2 flex-1 lg:h-full">
        <Scene modelUrl={garment.model} />

        <div className="absolute left-4 top-4 flex gap-2">
          {GARMENTS.map((g) => (
            <button
              key={g.slug}
              onClick={() => {
                setGarment(g);
                setSlug(g.slug);
              }}
              className={`rounded-lg px-3 py-1.5 text-xs font-medium backdrop-blur transition ${
                garment.slug === g.slug
                  ? 'bg-brand-600 text-white'
                  : 'bg-white/80 text-neutral-700 hover:bg-white'
              }`}
            >
              {g.label}
            </button>
          ))}
        </div>

        <div className="absolute bottom-4 left-1/2 flex -translate-x-1/2 gap-1 rounded-full bg-white/90 p-1 backdrop-blur dark:bg-neutral-900/90">
          {(['front', 'back'] as const).map((area) => (
            <button
              key={area}
              onClick={() => setActiveArea(area)}
              className={`rounded-full px-4 py-1.5 text-xs font-medium capitalize transition ${
                activeArea === area ? 'bg-brand-600 text-white' : 'text-neutral-600'
              }`}
            >
              {area}
            </button>
          ))}
        </div>
      </div>

      <aside className="h-1/2 w-full space-y-4 overflow-y-auto border-l border-neutral-200 p-5 dark:border-neutral-800 lg:h-full lg:w-[380px]">
        <h2 className="text-lg font-semibold">Designer</h2>
        <AIPanel />
        <TextPanel />
        <ColorPanel />
        <LayerPanel />

        <div className="flex gap-2 pt-2">
          <button
            onClick={saveDesign}
            disabled={saving}
            className="flex flex-1 items-center justify-center gap-2 rounded-lg bg-brand-600 py-2.5 text-sm font-medium text-white transition hover:bg-brand-700 disabled:opacity-60"
          >
            <Save className="h-4 w-4" />
            {saving ? 'Saving...' : 'Save'}
          </button>
          <button
            onClick={downloadPrintFile}
            className="flex items-center justify-center gap-2 rounded-lg border border-neutral-300 px-4 py-2.5 text-sm font-medium transition hover:bg-neutral-50 dark:border-neutral-700 dark:hover:bg-neutral-800"
          >
            <Download className="h-4 w-4" />
            Print file
          </button>
        </div>
      </aside>
    </main>
  );
}
