'use client';

import { ChevronUp, ChevronDown, Trash2, Image as ImageIcon, Type } from 'lucide-react';
import { useDesignStore } from '@/lib/store';

export function LayerPanel() {
  const { areas, activeArea, selectedLayerId, selectLayer, removeLayer, moveLayer } =
    useDesignStore();
  const layers = areas[activeArea];

  if (!layers.length) {
    return (
      <div className="rounded-xl border border-dashed border-neutral-300 p-6 text-center text-sm text-neutral-500 dark:border-neutral-700">
        No layers yet. Generate a design or add text to get started.
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-neutral-200 bg-white p-2 dark:border-neutral-800 dark:bg-neutral-900">
      {[...layers].reverse().map((layer) => (
        <div
          key={layer.id}
          onClick={() => selectLayer(layer.id)}
          className={`flex cursor-pointer items-center gap-2 rounded-lg px-2 py-2 text-sm transition ${
            selectedLayerId === layer.id
              ? 'bg-brand-50 dark:bg-brand-900/30'
              : 'hover:bg-neutral-50 dark:hover:bg-neutral-800'
          }`}
        >
          {layer.type === 'image' ? (
            <ImageIcon className="h-4 w-4 shrink-0 text-neutral-400" />
          ) : (
            <Type className="h-4 w-4 shrink-0 text-neutral-400" />
          )}
          <span className="flex-1 truncate">
            {layer.type === 'text' ? layer.text : 'Image layer'}
          </span>
          <button onClick={() => moveLayer(layer.id, 'up')} className="p-1 hover:text-brand-600">
            <ChevronUp className="h-4 w-4" />
          </button>
          <button onClick={() => moveLayer(layer.id, 'down')} className="p-1 hover:text-brand-600">
            <ChevronDown className="h-4 w-4" />
          </button>
          <button onClick={() => removeLayer(layer.id)} className="p-1 hover:text-red-600">
            <Trash2 className="h-4 w-4" />
          </button>
        </div>
      ))}
    </div>
  );
}
