import type { Equipo, EquipoInput } from './types'

const base = '/api/equipos'

async function request<T>(url: string, init?: RequestInit): Promise<T> {
  const response = await fetch(url, {
    ...init,
    headers: { 'Content-Type': 'application/json', ...init?.headers },
  })
  if (!response.ok) {
    let message = `Error HTTP ${response.status}`
    try {
      const body = await response.json()
      message = body.detail || body.message || body.error || message
    } catch { /* respuesta sin JSON */ }
    throw new Error(message)
  }
  if (response.status === 204) return undefined as T
  return response.json() as Promise<T>
}

export const equiposApi = {
  listar: (params: URLSearchParams) => request<Equipo[]>(`${base}?${params.toString()}`),
  obtener: (id: number) => request<Equipo>(`${base}/${id}`),
  crear: (data: EquipoInput) => request<Equipo>(base, { method: 'POST', body: JSON.stringify(data) }),
  actualizar: (id: number, data: EquipoInput) => request<Equipo>(`${base}/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  baja: (id: number) => request<Equipo>(`${base}/${id}`, { method: 'DELETE' }),
}
