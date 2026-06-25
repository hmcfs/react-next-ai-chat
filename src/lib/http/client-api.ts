'use client';

interface ClientResult<T> {
  code: number | string;
  msg: string;
  data?: T;
}

type RequestMethod = 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';

async function clientBaseRequest<T>(
  url: string, // ⚠️ 这里的 url 必须是 /api/xxx 开头的同源路径
  method: RequestMethod,
  body?: unknown,
  params?: Record<string, string | number | boolean>,
  options?: RequestInit
): Promise<ClientResult<T>> {
  const fetchHeaders = new Headers(options?.headers);

  if (!(body instanceof FormData)) {
    fetchHeaders.set('Content-Type', 'application/json');
  }

  // 拼接 Query 参数
  let fullUrl = url;
  if (params) {
    const searchParams = new URLSearchParams();
    Object.entries(params).forEach(([k, v]) => searchParams.append(k, String(v)));
    fullUrl += `?${searchParams.toString()}`;
  }

  const fetchOpt: RequestInit = {
    ...options,
    method,
    headers: fetchHeaders,
    credentials: 'include', // ⭐️ 浏览器自动携带同源 HttpOnly Cookie
  };

  if (body && !(body instanceof FormData)) {
    fetchOpt.body = JSON.stringify(body);
  }

  const res = await fetch(fullUrl, fetchOpt);

  let data: ClientResult<T> | null = null;
  try {
    data = await res.json();
  } catch {
    data = null;
  }

  // 客户端 401 统一拦截跳转
  if (res.status === 401) {
    if (window.location.pathname !== '/sign-in') {
      const redirect = encodeURIComponent(window.location.href);
      window.location.href = `/sign-in?redirect=${redirect}`;
    }
    throw new Error(data?.msg || '登录已失效，请重新登录');
  }

  if (!res.ok) {
    throw new Error(data?.msg || res.statusText || '接口请求失败');
  }

  return data as ClientResult<T>;
}

// 导出客户端专用 API
export const clientApi = {
  get: <T>(
    url: string,
    params?: Record<string, string | number | boolean>,
    options?: RequestInit
  ) => clientBaseRequest<T>(url, 'GET', undefined, params, options),
  post: <T>(url: string, body?: unknown, options?: RequestInit) =>
    clientBaseRequest<T>(url, 'POST', body, undefined, options),
  put: <T>(url: string, body?: unknown, options?: RequestInit) =>
    clientBaseRequest<T>(url, 'PUT', body, undefined, options),
  delete: <T>(url: string, options?: RequestInit) =>
    clientBaseRequest<T>(url, 'DELETE', undefined, undefined, options),
};
