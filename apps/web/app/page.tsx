import Link from 'next/link';
import { Sparkles, Shirt, Store, ShieldCheck } from 'lucide-react';

const FEATURES = [
  {
    icon: Sparkles,
    title: 'Describe it, see it',
    body: 'Write a few words and the AI renders artwork straight onto a 3D garment.',
  },
  {
    icon: Shirt,
    title: 'Real print areas',
    body: 'Front, back and sleeves with proper print bounds and 300 DPI export.',
  },
  {
    icon: Store,
    title: 'Sell your designs',
    body: 'Open a shop, publish designs, and earn on every order.',
  },
  {
    icon: ShieldCheck,
    title: 'Moderated marketplace',
    body: 'Every published design passes prompt and image review first.',
  },
];

export default function HomePage() {
  return (
    <main className="mx-auto max-w-6xl px-6 py-20">
      <section className="text-center">
        <span className="inline-block rounded-full bg-brand-50 px-4 py-1.5 text-sm text-brand-700 dark:bg-brand-900/30 dark:text-brand-300">
          Design AI v2
        </span>
        <h1 className="mt-6 text-balance text-5xl font-semibold tracking-tight sm:text-6xl">
          Turn a sentence into a shirt you can actually buy.
        </h1>
        <p className="mx-auto mt-5 max-w-2xl text-lg text-neutral-500">
          Generate artwork with AI, place it on a real 3D garment, and publish it to a marketplace
          with customer, seller and admin accounts built in.
        </p>
        <div className="mt-8 flex justify-center gap-3">
          <Link
            href="/designer"
            className="rounded-lg bg-brand-600 px-6 py-3 font-medium text-white transition hover:bg-brand-700"
          >
            Open the designer
          </Link>
          <Link
            href="/shop"
            className="rounded-lg border border-neutral-300 px-6 py-3 font-medium transition hover:bg-neutral-50 dark:border-neutral-700 dark:hover:bg-neutral-900"
          >
            Browse the marketplace
          </Link>
        </div>
      </section>

      <section className="mt-24 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {FEATURES.map(({ icon: Icon, title, body }) => (
          <div
            key={title}
            className="rounded-2xl border border-neutral-200 p-6 dark:border-neutral-800"
          >
            <Icon className="h-6 w-6 text-brand-600" />
            <h3 className="mt-4 font-medium">{title}</h3>
            <p className="mt-2 text-sm text-neutral-500">{body}</p>
          </div>
        ))}
      </section>
    </main>
  );
}
