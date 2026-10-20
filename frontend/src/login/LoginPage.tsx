import { useState, type FormEvent } from 'react'
import { AlertTriangle, Factory, LoaderCircle, LockKeyhole, ShieldCheck, UserRound } from 'lucide-react'
import { Navigate, useSearchParams } from 'react-router-dom'
import { useAuth } from '../auth/auth'

export default function LoginPage() {
  const { usuario, loading, error: sessionError, needsSetup, crearCuentaInicial, iniciarSesion } = useAuth()
  const [search] = useSearchParams()
  const [identificador, setIdentificador] = useState('')
  const [nombre, setNombre] = useState('')
  const [username, setUsername] = useState('')
  const [correo, setCorreo] = useState('')
  const [codigoEmpleado, setCodigoEmpleado] = useState('')
  const [password, setPassword] = useState('')
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  const loggedOut = search.get('logout') === '1'

  if (loading) return <div className="auth-screen"><LoaderCircle className="spin" size={25} /><span>Verificando sesión…</span></div>
  if (usuario) return <Navigate to="/" replace />

  async function enviar(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setBusy(true)
    setError('')
    try {
      if (needsSetup) {
        await crearCuentaInicial({ username: username.trim(), nombre: nombre.trim(), correo: correo.trim() || null, codigoEmpleado: codigoEmpleado.trim() || null, password })
      } else {
        await iniciarSesion(identificador.trim(), password)
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No fue posible completar el acceso')
      setPassword('')
      setBusy(false)
    }
  }

  return (
    <main className="auth-screen">
      <div className="login-brand"><div className="brand-icon"><Factory size={23} /></div><div><strong>Control Principal</strong><span>GESTIÓN INDUSTRIAL</span></div></div>
      <section className="login-card" aria-labelledby="login-title">
        <div className="login-mark"><ShieldCheck size={23} /></div>
        <div className="eyebrow">{needsSetup ? 'CONFIGURACIÓN INICIAL' : 'INGRESO AL SISTEMA'}</div>
        <h1 id="login-title">{needsSetup ? 'Crear cuenta administradora' : 'Iniciar Sesion'}</h1>
        <p className="login-description">{needsSetup ? 'Crea la primera cuenta. Se guardará en la base de datos con su ID de usuario y habilitará el login.' : 'Ingresa con tus credenciales para revisar y administrar los activos de la planta.'}</p>
        {loggedOut && <div className="login-message success">Sesión cerrada correctamente.</div>}
        {(error || sessionError) && <div className="login-message failure"><AlertTriangle size={16} /><span>{error || sessionError}</span></div>}
        <form className="login-form" onSubmit={enviar}>
          {needsSetup ? <>
            <label className="auth-field"><span>Nombre completo</span><div><UserRound size={16} /><input required autoComplete="name" maxLength={160} value={nombre} onChange={event => setNombre(event.target.value)} placeholder="Nombre del administrador" /></div></label>
            <label className="auth-field"><span>Nombre de usuario</span><div><UserRound size={16} /><input required autoComplete="username" minLength={3} maxLength={80} value={username} onChange={event => setUsername(event.target.value)} placeholder="admin" /></div></label>
            <label className="auth-field"><span>Correo electrónico <small>(opcional)</small></span><div><UserRound size={16} /><input type="email" autoComplete="email" maxLength={320} value={correo} onChange={event => setCorreo(event.target.value)} placeholder="nombre@empresa.cl" /></div></label>
            <label className="auth-field"><span>Código de empleado <small>(opcional)</small></span><div><UserRound size={16} /><input maxLength={60} value={codigoEmpleado} onChange={event => setCodigoEmpleado(event.target.value)} placeholder="EMP-001" /></div></label>
          </> : <label className="auth-field"><span>Usuario o correo electrónico</span><div><UserRound size={16} /><input required autoComplete="username" maxLength={320} value={identificador} onChange={event => setIdentificador(event.target.value)} placeholder="usuario@empresa.cl" /></div></label>}
          <label className="auth-field"><span>{needsSetup ? 'Contraseña (mínimo 12 caracteres)' : 'Contraseña'}</span><div><LockKeyhole size={16} /><input required type="password" autoComplete={needsSetup ? 'new-password' : 'current-password'} minLength={needsSetup ? 12 : undefined} maxLength={72} value={password} onChange={event => setPassword(event.target.value)} placeholder={needsSetup ? 'Crea una contraseña segura' : 'Ingresa tu contraseña'} /></div></label>
          <button className="primary-btn login-button" type="submit" disabled={busy}>
            {busy ? <LoaderCircle className="spin" size={18} /> : <ShieldCheck size={18} />}
            {busy ? (needsSetup ? 'Creando cuenta…' : 'Validando…') : (needsSetup ? 'Crear cuenta inicial' : 'Iniciar sesión')}
          </button>
        </form>
        <div className="login-security"><ShieldCheck size={15} /><span>Contraseñas protegidas con BCrypt; sesión validada en el servidor.</span></div>
        <p className="login-help">{needsSetup ? 'Esta pantalla se desactiva cuando se crea la primera cuenta.' : 'Si no tienes cuenta, solicita acceso al administrador del sistema.'}</p>
      </section>
      <p className="login-footer">Panel de Control <span>•</span> Mantenimiento industrial</p>
    </main>
  )
}
