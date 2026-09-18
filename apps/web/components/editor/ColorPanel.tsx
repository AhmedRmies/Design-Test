'use client';

import { useDesignStore } from '@/lib/store';

const COLORS = [
  { name: 'White', hex: '#FFFFFF' },
  { name: 'Black', hex: '#111111' },
  { name: 'Navy', hex: '#1F2A44' },
  { name: 'Heather Grey', hex: '#B8B8B8' },
  { name: 'Sand', hex: '#D9CBB3' },
  { name: 'Forest', hex: '#2F4F3E' },
];

export function ColorPanel() {
  const colorHex = useDesignStore((s) => s.colorHex);
  const setColor = useDesignStore((s) => s.setColor);

  return (
    <div className="rounded-xl border border-neutral-200 bg-white p-4 dark:border-neutral-800 dark:bg-neutral-900">
      <div className="mb-3 text-sm font-medium">Garment colour</div>
      <div className="flex flex-wrap gap-2">
        {COLORS.map((c) => (
          <button
            key={c.hex}
            title={c.name}
            onClick={() => setColor(c.hex)}
            style={{ backgroundColor: c.hex }}
            className={`h-9 w-9 rounded-full border-2 transition ${
              colorHex === c.hex ? 'border-brand-600 scale-110' : 'border-neutral-300'
            }`}
          />
        ))}
      </div>
    </div>
  );
}
