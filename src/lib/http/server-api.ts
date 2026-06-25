import { cookies } from 'next/headers';

const BACKEND_URL = process.env.BASE_URL || '';

interface ServerResult<T> {
  code: number | string;
  msg: string;
  data?: T;
}

type RequestMethod = 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';

async function serverBaseRequest<T>(
  url: string,
  method: RequestMethod,
  body?: unknown,
  params?: Record<string, string | number | boolean>,
  options?: RequestInit
): Promise<ServerResult<T>> {
  // 1. 提取并拼接当前请求的所有 HttpOnly Cookie
  const cookieStore = await cookies();
  const allCookies = cookieStore.getAll();
  const cookieString = allCookies.map((c) => `${c.name}=${c.value}`).join('; ');

  // 2. 构建请求头
  const fetchHeaders = new Headers(options?.headers);
  if (cookieString) {
    fetchHeaders.set('Cookie', cookieString);
  }
  if (!(body instanceof FormData)) {
    fetchHeaders.set('Content-Type', 'application/json');
  }

  // 3. 拼接 URL 与 Query 参数
  let fullUrl = `${BACKEND_URL}${url}`;
  if (params) {
    const searchParams = new URLSearchParams();
    Object.entries(params).forEach(([k, v]) => searchParams.append(k, String(v)));
    fullUrl += `?${searchParams.toString()}`;
  }

  // 4. 发起服务端请求
  const fetchOpt: RequestInit = {
    ...options,
    method,
    headers: fetchHeaders,
  };
  if (body && !(body instanceof FormData)) {
    fetchOpt.body = JSON.stringify(body);
  }

  const res = await fetch(fullUrl, fetchOpt);

  // 5. 解析响应
  let data: ServerResult<T> | null = null;
  try {
    data = await res.json();
  } catch {
    data = null;
  }

  if (!res.ok) {
    throw new Error(data?.msg || `Backend Error: ${res.status}`);
  }

  return data as ServerResult<T>;
}

// 导出服务端专用 API
export const serverApi = {
  get: <T>(
    url: string,
    params?: Record<string, string | number | boolean>,
    options?: RequestInit
  ) => serverBaseRequest<T>(url, 'GET', undefined, params, options),
  post: <T>(url: string, body?: unknown, options?: RequestInit) =>
    serverBaseRequest<T>(url, 'POST', body, undefined, options),
  put: <T>(url: string, body?: unknown, options?: RequestInit) =>
    serverBaseRequest<T>(url, 'PUT', body, undefined, options),
  delete: <T>(url: string, options?: RequestInit) =>
    serverBaseRequest<T>(url, 'DELETE', undefined, undefined, options),
};
