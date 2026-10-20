import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'
import type { ReactNode } from 'react'
import { authApi, ApiError } from './api'
import type { UsuarioPerfil } from './types'

type AuthContextValue = {
  usuario: UsuarioPerfil | null
  loading: boolean
  error: string
  needsSetup: boolean
  crearCuentaInicial: (data: { username: string; nombre: string; correo: string | null; codigoEmpleado: string | null; password: string }) => Promise<void>
  iniciarSesion: (identificador: string, password: string) => Promise<void>
  cerrarSesion: () => Promise<void>
  refrescar: () => Promise<void>
}

const AuthContext = createContext<AuthContextValue | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [usuario, setUsuario] = useState<UsuarioPerfil | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [needsSetup, setNeedsSetup] = useState(false)

  const refrescar = useCallback(async () => {
    setLoading(true)
    setError('')
    try {
      const setup = await authApi.setupStatus()
      setNeedsSetup(setup.setupRequired)
      if (setup.setupRequired) {
        setUsuario(null)
        return
      }
      setUsuario(await authApi.me())
    } catch (err) {
      if (err instanceof ApiError && err.status === 401) setUsuario(null)
      else setError(err instanceof Error ? err.message : 'No fue posible validar la sesión')
    } finally {
      setLoading(false)
    }
  }, [])

  const crearCuentaInicial = useCallback(async (data: { username: string; nombre: string; correo: string | null; codigoEmpleado: string | null; password: string }) => {
    setError('')
    setUsuario(await authApi.setupInicial(data))
    setNeedsSetup(false)
  }, [])

  useEffect(() => {
    void refrescar()
    const onUnauthorized = () => {
      setUsuario(null)
      setLoading(false)
    }
    window.addEventListener('catastro:unauthorized', onUnauthorized)
    return () => window.removeEventListener('catastro:unauthorized', onUnauthorized)
  }, [refrescar])

  const iniciarSesion = useCallback(async (identificador: string, password: string) => {
    setError('')
    setUsuario(await authApi.login(identificador, password))
    setNeedsSetup(false)
  }, [])

  const cerrarSesion = useCallback(async () => {
    await authApi.cerrar()
    setUsuario(null)
    setNeedsSetup(false)
  }, [])

  const value = useMemo(() => ({ usuario, loading, error, needsSetup, crearCuentaInicial, iniciarSesion, cerrarSesion, refrescar }), [usuario, loading, error, needsSetup, crearCuentaInicial, iniciarSesion, cerrarSesion, refrescar])
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const value = useContext(AuthContext)
  if (!value) throw new Error('useAuth debe utilizarse dentro de AuthProvider')
  return value
}
