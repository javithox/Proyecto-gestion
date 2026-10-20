import type { Equipo, EquipoInput, UsuarioAdminInput, UsuarioPerfil } from './types'

export class ApiError extends Error {
  constructor(message: string, readonly status: number) {
    super(message)
    this.name = 'ApiError'
  }
}

async function request<T>(url: string, init: RequestInit = {}): Promise<T> {
  let response: Response
  try {
    const headers = new Headers(init.headers)
    headers.set('Accept', 'application/json')
    if (init.body !== undefined && !headers.has('Content-Type')) headers.set('Content-Type', 'application/json')
    response = await fetch(url, { ...init, headers, credentials: 'same-origin' })
  } catch {
    throw new Error('No se pudo conectar con el servidor. Revisa la conexión e inténtalo nuevamente.')
  }

  if (response.status === 204) return undefined as T
  const text = await response.text()
  let body: Record<string, unknown> | undefined
  if (text) {
    try { body = JSON.parse(text) as Record<string, unknown> } catch { body = undefined }
  }
  if (!response.ok) {
    if (response.status === 401) window.dispatchEvent(new Event('catastro:unauthorized'))
    const message = typeof body?.message === 'string' ? body.message
      : typeof body?.detail === 'string' ? body.detail
        : typeof body?.error === 'string' ? body.error
          : text && !body ? text : `No fue posible completar la solicitud (${response.status})`
    throw new ApiError(message, response.status)
  }
  return (body ?? (text ? JSON.parse(text) : undefined)) as T
}

export const authApi = {
  setupStatus: () => request<{ setupRequired: boolean }>('/api/auth/setup-status'),
  setupInicial: (data: { username: string; nombre: string; correo: string | null; codigoEmpleado: string | null; password: string }) =>
    request<UsuarioPerfil>('/api/auth/setup', { method: 'POST', body: JSON.stringify(data) }),
  login: (identificador: string, password: string) => request<UsuarioPerfil>('/api/auth/login', {
    method: 'POST',
    body: JSON.stringify({ identificador, password }),
  }),
  me: () => request<UsuarioPerfil>('/api/auth/me'),
  cerrar: () => request<void>('/api/auth/logout', { method: 'POST' }),
}

const base = '/api/equipos'
export const equiposApi = {
  listar: (params: URLSearchParams, signal?: AbortSignal) => request<Equipo[]>(`${base}?${params.toString()}`, { signal }),
  obtener: (id: number) => request<Equipo>(`${base}/${id}`),
  crear: (data: EquipoInput) => request<Equipo>(base, { method: 'POST', body: JSON.stringify(data) }),
  actualizar: (id: number, data: EquipoInput) => request<Equipo>(`${base}/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  baja: (id: number) => request<Equipo>(`${base}/${id}`, { method: 'DELETE' }),
}


export const usuariosAdminApi = {
  listar: () => request<UsuarioPerfil[]>('/api/admin/usuarios'),
  crear: (data: UsuarioAdminInput) => request<UsuarioPerfil>('/api/admin/usuarios', { method: 'POST', body: JSON.stringify(data) }),
  actualizar: (id: number, data: UsuarioAdminInput) => request<UsuarioPerfil>(`/api/admin/usuarios/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  eliminar: (id: number) => request<void>(`/api/admin/usuarios/${id}`, { method: 'DELETE' }),
}
