/**
 * Cliente HTTP mínimo sobre fetch.
 *
 * - La URL base sale de `VITE_API_URL` (.env.local), p. ej. `http://localhost:8000/api/v1`.
 * - Si `VITE_API_URL` está vacía, `USE_MOCKS` es true y cada servicio
 *   responde con los datos de `src/mocks` (útil para maquetar sin el back).
 * - El token de sesión se envía como `Authorization: Bearer <token>`.
 * - Los errores de la API llegan como `{ detail }`: un texto, o la lista de
 *   errores de validación de FastAPI (422).
 */

const BASE_URL = (import.meta.env.VITE_API_URL ?? '').replace(/\/$/, '')

export const USE_MOCKS = BASE_URL === ''

export const TOKEN_KEY = 'mu_token'

/** Se llama cuando la API responde 401 con una sesión guardada (token vencido o inválido). */
let alExpirarSesion: () => void = () => {}
export function onSesionExpirada(fn: () => void) {
  alExpirarSesion = fn
}

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

type QueryValue = string | number | boolean | undefined | null

interface RequestOptions {
  method?: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE'
  /** Objeto (se envía como JSON), FormData (multipart) o URLSearchParams (formulario). */
  body?: unknown
  query?: Record<string, QueryValue | QueryValue[]>
  headers?: Record<string, string>
}

function buildUrl(path: string, query?: RequestOptions['query']) {
  const url = new URL(
    `${BASE_URL}${path.startsWith('/') ? path : `/${path}`}`,
    window.location.origin,
  )
  for (const [key, value] of Object.entries(query ?? {})) {
    // Las listas se repiten: ?amenidad_ids=1&amenidad_ids=3
    for (const v of Array.isArray(value) ? value : [value]) {
      if (v !== undefined && v !== null && v !== '') url.searchParams.append(key, String(v))
    }
  }
  return url.toString()
}

/** Convierte la respuesta de error de FastAPI en un mensaje para mostrar al usuario. */
function mensajeDeError(data: unknown, status: number, statusText: string): string {
  const detail = data && typeof data === 'object' && 'detail' in data ? data.detail : undefined
  if (typeof detail === 'string') return detail
  if (Array.isArray(detail) && detail.length) {
    const { loc = [], msg = 'Dato inválido' } = detail[0] as { loc?: string[]; msg?: string }
    const campo = loc.filter((x) => x !== 'body' && x !== 'query').join('.')
    return campo ? `${campo}: ${msg}` : msg
  }
  if (status === 0 || status >= 500) return 'No se pudo conectar con el servidor. Intenta de nuevo.'
  return statusText || 'Ocurrió un error'
}

export async function http<T>(path: string, options: RequestOptions = {}): Promise<T> {
  const { method = 'GET', body, query, headers = {} } = options
  const token = localStorage.getItem(TOKEN_KEY)
  // FormData y URLSearchParams los envía fetch con su propio Content-Type.
  const crudo = body instanceof FormData || body instanceof URLSearchParams

  let res: Response
  try {
    res = await fetch(buildUrl(path, query), {
      method,
      headers: {
        Accept: 'application/json',
        ...(body !== undefined && !crudo ? { 'Content-Type': 'application/json' } : {}),
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        ...headers,
      },
      body: body === undefined ? undefined : crudo ? (body as BodyInit) : JSON.stringify(body),
    })
  } catch {
    throw new ApiError(0, mensajeDeError(undefined, 0, ''))
  }

  const text = await res.text()
  const data = text ? safeJson(text) : undefined

  if (!res.ok) {
    if (res.status === 401 && token) alExpirarSesion()
    throw new ApiError(res.status, mensajeDeError(data, res.status, res.statusText), data)
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
