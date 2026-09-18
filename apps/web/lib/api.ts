const API_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:4000';

let accessToken: string | null = null;
export const setAccessToken = (token: string | null) => {
  accessToken = token;
};

export class ApiError extends Error {
  constructor(
    public statusCode: number,
    message: string,
  ) {
    super(message);
  }
}

async function request<T>(path: string, init: RequestInit = {}): Promise<T> {
  const res = await fetch(`${API_URL}/api${path}`, {
    ...init,
    headers: {
      'Content-Type': 'application/json',
      ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
      ...init.headers,
    },
  });

  if (!res.ok) {
    const body = await res.json().catch(() => ({ message: res.statusText }));
    throw new ApiError(res.status, body.message ?? 'Request failed');
  }
  return res.status === 204 ? (undefined as T) : res.json();
}

export const api = {
  get: <T>(path: string) => request<T>(path),
  post: <T>(path: string, body?: unknown) =>
    request<T>(path, { method: 'POST', body: JSON.stringify(body ?? {}) }),
  patch: <T>(path: string, body?: unknown) =>
    request<T>(path, { method: 'PATCH', body: JSON.stringify(body ?? {}) }),
  delete: <T>(path: string) => request<T>(path, { method: 'DELETE' }),
};

/** Subscribes to a generation's SSE stream and calls back on every status change. */
export function streamGeneration(id: string, onUpdate: (g: any) => void) {
  const source = new EventSource(`${API_URL}/api/generations/${id}/stream`, {
    withCredentials: true,
  });
  source.onmessage = (event) => {
    const data = JSON.parse(event.data);
    onUpdate(data);
    if (['COMPLETED', 'FAILED', 'REJECTED'].includes(data.status)) source.close();
  };
  source.onerror = () => source.close();
  return () => source.close();
}
