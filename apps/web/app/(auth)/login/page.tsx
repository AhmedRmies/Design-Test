'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import toast from 'react-hot-toast';
import { useAuthStore } from '@/lib/auth-store';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const login = useAuthStore((s) => s.login);
  const router = useRouter();

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      await login(email, password);
      toast.success('Welcome back');
      router.push('/designer');
    } catch (err: any) {
      toast.error(err.message ?? 'Login failed');
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="mx-auto flex min-h-screen max-w-md flex-col justify-center px-6">
      <h1 className="text-2xl font-semibold">Sign in</h1>
      <p className="mt-1 text-sm text-neutral-500">Continue to your designs.</p>

      <form onSubmit={submit} className="mt-8 space-y-3">
        <input
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="you@example.com"
          className="w-full rounded-lg border border-neutral-300 bg-transparent p-3 text-sm outline-none focus:border-brand-500 dark:border-neutral-700"
        />
        <input
          type="password"
          required
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Password"
          className="w-full rounded-lg border border-neutral-300 bg-transparent p-3 text-sm outline-none focus:border-brand-500 dark:border-neutral-700"
        />
        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-lg bg-brand-600 py-3 text-sm font-medium text-white transition hover:bg-brand-700 disabled:opacity-60"
        >
          {loading ? 'Signing in...' : 'Sign in'}
        </button>
      </form>

      <p className="mt-6 text-center text-sm text-neutral-500">
        No account?{' '}
        <Link href="/register" className="text-brand-600 hover:underline">
          Create one
        </Link>
      </p>
    </main>
  );
}
