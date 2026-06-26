'use client';
interface Result<T> {
  code: number | string;
  msg: string;
  data?: T;
}
async function request<T>(url: string, options?: RequestInit): Promise<Result<T>> {
  const headers = new Headers(options?.headers ?? {});
  if (!(options?.body instanceof FormData)) headers.set('Content-Type', 'application/json');
  const res = await fetch(url, { ...options, headers });

  if (res.status === 401) {
    if (window.location.pathname !== '/sign-in') {
      const redirect = encodeURIComponent(window.location.href);
      window.location.href = `/sign-in?redirect=${redirect}`;
    }
    throw new Error('Unauthorized');
  }
  const data = await res.json().catch(() => null);

  if (!res.ok) {
    const err = data || { message: res.statusText };
    throw new Error(err.message || 'Request failed');
  }

  return data as Result<T>;
}
export const clientApi = {
  get: <T>(url: string, options?: RequestInit) => request<T>(url, { ...options, method: 'GET' }),
  post: <T>(url: string, body?: unknown, options?: RequestInit) =>
    request<T>(url, { ...options, method: 'POST', body: JSON.stringify(body) }),
  put: <T>(url: string, body?: unknown, options?: RequestInit) =>
    request<T>(url, { ...options, method: 'PUT', body: JSON.stringify(body) }),
  delete: <T>(url: string, options?: RequestInit) =>
    request<T>(url, { ...options, method: 'DELETE' }),
};
