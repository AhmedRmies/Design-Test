'use client';

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { api, setAccessToken } from './api';

export interface AuthUser {
  id: string;
  email: string;
  name: string;
  role: 'CUSTOMER' | 'SELLER' | 'ADMIN';
  credits: number;
  avatarUrl?: string | null;
}

interface AuthState {
  user: AuthUser | null;
  accessToken: string | null;
  refreshToken: string | null;
  login: (email: string, password: string) => Promise<void>;
  register: (input: {
    email: string;
    password: string;
    name: string;
    role?: 'CUSTOMER' | 'SELLER';
  }) => Promise<void>;
  logout: () => Promise<void>;
  hydrate: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      accessToken: null,
      refreshToken: null,

      login: async (email, password) => {
        const data = await api.post<any>('/auth/login', { email, password });
        setAccessToken(data.accessToken);
        set({ user: data.user, accessToken: data.accessToken, refreshToken: data.refreshToken });
      },

      register: async (input) => {
        const data = await api.post<any>('/auth/register', input);
        setAccessToken(data.accessToken);
        set({ user: data.user, accessToken: data.accessToken, refreshToken: data.refreshToken });
      },

      logout: async () => {
        const token = get().refreshToken;
        if (token) await api.post('/auth/logout', { refreshToken: token }).catch(() => {});
        setAccessToken(null);
        set({ user: null, accessToken: null, refreshToken: null });
      },

      hydrate: () => setAccessToken(get().accessToken),
    }),
    { name: 'designai-auth' },
  ),
);
