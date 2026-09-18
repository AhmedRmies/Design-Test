'use client';

import { useState } from 'react';
import toast from 'react-hot-toast';
import { Sparkles, Loader2 } from 'lucide-react';
import { api, streamGeneration } from '@/lib/api';
import { useDesignStore } from '@/lib/store';

const STYLES = ['vector', 'illustration', 'minimal', 'retro', 'anime', 'photoreal'] as const;

export function AIPanel() {
  const [prompt, setPrompt] = useState('');
  const [style, setStyle] = useState<(typeof STYLES)[number]>('vector');
  const [status, setStatus] = useState<string | null>(null);
  const addLayer = useDesignStore((s) => s.addLayer);

  const busy = status !== null && !['COMPLETED', 'FAILED', 'REJECTED'].includes(status);

  async function generate() {
    if (prompt.trim().length < 3) {
      toast.error('Describe your design in a few more words.');
      return;
    }

    try {
      setStatus('QUEUED');
      const { id } = await api.post<{ id: string }>('/generations', { prompt, style });

      streamGeneration(id, (generation) => {
        setStatus(generation.status);

        if (generation.status === 'COMPLETED' && generation.imageUrl) {
          addLayer({
            id: crypto.randomUUID(),
            type: 'image',
            src: generation.imageUrl,
            x: 312,
            y: 312,
            width: 400,
            height: 400,
            rotation: 0,
            opacity: 1,
          });
          toast.success('Design added to your shirt');
          setStatus(null);
        }

        if (['FAILED', 'REJECTED'].includes(generation.status)) {
          toast.error(generation.error ?? 'Generation failed');
          setStatus(null);
        }
      });
    } catch (err: any) {
      toast.error(err.message ?? 'Could not start generation');
      setStatus(null);
    }
  }

  return (
    <div className="space-y-3 rounded-xl border border-neutral-200 bg-white p-4 dark:border-neutral-800 dark:bg-neutral-900">
      <div className="flex items-center gap-2 text-sm font-medium">
        <Sparkles className="h-4 w-4 text-brand-500" />
        Describe your design
      </div>

      <textarea
        value={prompt}
        onChange={(e) => setPrompt(e.target.value)}
        rows={3}
        maxLength={500}
        placeholder="a wolf howling at a geometric moon, bold linework"
        className="w-full resize-none rounded-lg border border-neutral-200 bg-transparent p-3 text-sm outline-none focus:border-brand-500 dark:border-neutral-700"
      />

      <div className="flex flex-wrap gap-1.5">
        {STYLES.map((s) => (
          <button
            key={s}
            onClick={() => setStyle(s)}
            className={`rounded-full px-3 py-1 text-xs capitalize transition ${
              style === s
                ? 'bg-brand-600 text-white'
                : 'bg-neutral-100 text-neutral-600 hover:bg-neutral-200 dark:bg-neutral-800 dark:text-neutral-300'
            }`}
          >
            {s}
          </button>
        ))}
      </div>

      <button
        onClick={generate}
        disabled={busy}
        className="flex w-full items-center justify-center gap-2 rounded-lg bg-brand-600 py-2.5 text-sm font-medium text-white transition hover:bg-brand-700 disabled:opacity-60"
      >
        {busy ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin" />
            {status?.toLowerCase()}...
          </>
        ) : (
          'Generate design'
        )}
      </button>
    </div>
  );
}
