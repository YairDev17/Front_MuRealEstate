/**
 * Cliente HTTP mínimo sobre fetch.
 *
 * - La URL base sale de `VITE_API_URL` (.env.local).
 * - Si `VITE_API_URL` está vacía, `USE_MOCKS` es true y cada servicio
 *   responde con los datos de `src/mocks` (útil mientras el back no existe).
 * - El token de sesión se envía como `Authorization: Bearer <token>`.
 */

const BASE_URL = (import.meta.env.VITE_API_URL ?? '').replace(/\/$/, '')

export const USE_MOCKS = BASE_URL === ''

export const TOKEN_KEY = 'mu_token'

export class ApiError extends Error {
  constructor(
    public status: number,
    message: string,
    public data?: unknown,
  ) {
    super(message)
    this.name = 'ApiError'
  }
}

type Query = Record<string, string | number | boolean | undefined | null>

interface RequestOptions {
  method?: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE'
  body?: unknown
  query?: Query
  headers?: Record<string, string>
}

function buildUrl(path: string, query?: Query) {
  const url = new URL(`${BASE_URL}${path.startsWith('/') ? path : `/${path}`}`, window.location.origin)
  if (query) {
    for (const [key, value] of Object.entries(query)) {
      if (value !== undefined && value !== null && value !== '') url.searchParams.set(key, String(value))
    }
  }
  return url.toString()
}

export async function http<T>(path: string, options: RequestOptions = {}): Promise<T> {
  const { method = 'GET', body, query, headers = {} } = options
  const token = localStorage.getItem(TOKEN_KEY)
  const isFormData = body instanceof FormData

  const res = await fetch(buildUrl(path, query), {
    method,
    headers: {
      Accept: 'application/json',
      ...(body !== undefined && !isFormData ? { 'Content-Type': 'application/json' } : {}),
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...headers,
    },
    body: body === undefined ? undefined : isFormData ? body : JSON.stringify(body),
  })

  const text = await res.text()
  const data = text ? safeJson(text) : undefined

  if (!res.ok) {
    const message =
      (data && typeof data === 'object' && 'message' in data && String(data.message)) || res.statusText
    throw new ApiError(res.status, message, data)
  }
  return data as T
}

function safeJson(text: string) {
  try {
    return JSON.parse(text)
  } catch {
    return text
  }
}

/** Simula la latencia de red para las respuestas mock. */
export function mockDelay<T>(value: T, ms = 600): Promise<T> {
  return new Promise((resolve) => setTimeout(() => resolve(structuredClone(value)), ms))
}
