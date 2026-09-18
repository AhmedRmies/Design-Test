'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import toast from 'react-hot-toast';
import { useAuthStore } from '@/lib/auth-store';

export default function RegisterPage() {
  const [form, setForm] = useState({ name: '', email: '', password: '' });
  const [role, setRole] = useState<'CUSTOMER' | 'SELLER'>('CUSTOMER');
  const [loading, setLoading] = useState(false);
  const register = useAuthStore((s) => s.register);
  const router = useRouter();

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      await register({ ...form, role });
      toast.success('Account created');
      router.push('/designer');
    } catch (err: any) {
      toast.error(err.message ?? 'Registration failed');
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="mx-auto flex min-h-screen max-w-md flex-col justify-center px-6">
      <h1 className="text-2xl font-semibold">Create your account</h1>

      <div className="mt-6 flex gap-2">
        {(['CUSTOMER', 'SELLER'] as const).map((r) => (
          <button
            key={r}
            onClick={() => setRole(r)}
            className={`flex-1 rounded-lg border p-3 text-sm transition ${
              role === r
                ? 'border-brand-600 bg-brand-50 dark:bg-brand-900/30'
                : 'border-neutral-300 dark:border-neutral-700'
            }`}
          >
            {r === 'CUSTOMER' ? 'I want to buy' : 'I want to sell'}
          </button>
        ))}
      </div>

      <form onSubmit={submit} className="mt-4 space-y-3">
        <input
          required
          value={form.name}
          onChange={(e) => setForm({ ...form, name: e.target.value })}
          placeholder="Full name"
          className="w-full rounded-lg border border-neutral-300 bg-transparent p-3 text-sm outline-none focus:border-brand-500 dark:border-neutral-700"
        />
        <input
          type="email"
          required
          value={form.email}
          onChange={(e) => setForm({ ...form, email: e.target.value })}
          placeholder="you@example.com"
          className="w-full rounded-lg border border-neutral-300 bg-transparent p-3 text-sm outline-none focus:border-brand-500 dark:border-neutral-700"
        />
        <input
          type="password"
          required
          minLength={8}
          value={form.password}
          onChange={(e) => setForm({ ...form, password: e.target.value })}
          placeholder="Password (min 8 characters)"
          className="w-full rounded-lg border border-neutral-300 bg-transparent p-3 text-sm outline-none focus:border-brand-500 dark:border-neutral-700"
        />
        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-lg bg-brand-600 py-3 text-sm font-medium text-white transition hover:bg-brand-700 disabled:opacity-60"
        >
          {loading ? 'Creating...' : 'Create account'}
        </button>
      </form>

      <p className="mt-6 text-center text-sm text-neutral-500">
        Already registered?{' '}
        <Link href="/login" className="text-brand-600 hover:underline">
          Sign in
        </Link>
      </p>
    </main>
  );
}
