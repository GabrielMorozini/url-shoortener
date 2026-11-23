import type { ShortLink } from './types'

const API_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:8000'

interface ApiErrorBody {
  message?: string
  errors?: Record<string, string[]>
}

export class ApiError extends Error { }

function getSessionId() {
  let id = sessionStorage.getItem('session_id')
  if (!id) {
    id = crypto.randomUUID()
    sessionStorage.setItem('session_id', id)
  }
  return id
}

const SESSION_ID = getSessionId()

function extractMessage(data: ApiErrorBody | null) {
  const firstFieldError = data?.errors && Object.values(data.errors)[0]?.[0]
  return firstFieldError ?? data?.message
}

async function request<T>(
  path: string,
  options: RequestInit = {},
  fallbackMessage = 'Algo deu errado. Tente novamente.',
): Promise<T> {
  let res: Response

  try {
    res = await fetch(`${API_URL}/api${path}`, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
        'X-Session-Id': SESSION_ID,
      },
    })
  } catch {
    throw new ApiError('Erro de conexão com a API.')
  }

  const data = res.status === 204 ? null : await res.json().catch(() => null)

  if (!res.ok) {
    throw new ApiError(extractMessage(data) ?? fallbackMessage)
  }

  return data as T
}

export async function listLinks() {
  const body = await request<{ data: ShortLink[] }>(
    '/links',
    {},
    'Não foi possível carregar os links. A API está rodando?',
  )
  return body.data
}

export function createLink(url: string) {
  return request<ShortLink>(
    '/links',
    { method: 'POST', body: JSON.stringify({ url }) },
    'Não foi possível encurtar a URL.',
  )
}

export function updateLink(code: string, url: string) {
  return request<ShortLink>(
    `/links/${code}`,
    { method: 'PATCH', body: JSON.stringify({ url }) },
    'Não foi possível editar o link.',
  )
}

export function deleteLink(code: string) {
  return request<null>(
    `/links/${code}`,
    { method: 'DELETE' },
    'Não foi possível apagar o link.',
  )
}