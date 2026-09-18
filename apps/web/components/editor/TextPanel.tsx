'use client';

import { useState } from 'react';
import { useDesignStore } from '@/lib/store';

const FONTS = ['Inter', 'Georgia', 'Impact', 'Courier New', 'Verdana'];

export function TextPanel() {
  const [text, setText] = useState('');
  const [fill, setFill] = useState('#111111');
  const [fontFamily, setFontFamily] = useState(FONTS[0]);
  const addLayer = useDesignStore((s) => s.addLayer);

  function add() {
    if (!text.trim()) return;
    addLayer({
      id: crypto.randomUUID(),
      type: 'text',
      text,
      fontFamily,
      fontSize: 72,
      fill,
      x: 512,
      y: 512,
      rotation: 0,
    });
    setText('');
  }

  return (
    <div className="space-y-3 rounded-xl border border-neutral-200 bg-white p-4 dark:border-neutral-800 dark:bg-neutral-900">
      <div className="text-sm font-medium">Add text</div>
      <input
        value={text}
        onChange={(e) => setText(e.target.value)}
        maxLength={40}
        placeholder="Your slogan"
        className="w-full rounded-lg border border-neutral-200 bg-transparent p-2.5 text-sm outline-none focus:border-brand-500 dark:border-neutral-700"
      />
      <div className="flex gap-2">
        <select
          value={fontFamily}
          onChange={(e) => setFontFamily(e.target.value)}
          className="flex-1 rounded-lg border border-neutral-200 bg-transparent p-2 text-sm dark:border-neutral-700"
        >
          {FONTS.map((f) => (
            <option key={f} value={f}>
              {f}
            </option>
          ))}
        </select>
        <input
          type="color"
          value={fill}
          onChange={(e) => setFill(e.target.value)}
          className="h-10 w-12 rounded-lg border border-neutral-200 dark:border-neutral-700"
        />
      </div>
      <button
        onClick={add}
        className="w-full rounded-lg border border-neutral-300 py-2 text-sm font-medium transition hover:bg-neutral-50 dark:border-neutral-700 dark:hover:bg-neutral-800"
      >
        Add text layer
      </button>
    </div>
  );
}
