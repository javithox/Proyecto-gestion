import { useState } from 'react'
import type { ReactNode } from 'react'
import { AlertTriangle, ArrowLeft, BadgeCheck, CalendarDays, Hash, LogOut, Mail, UserRound, UsersRound } from 'lucide-react'
import { Link, useNavigate } from 'react-router-dom'
import AppShell from './AppShell'
import { useAuth } from './auth'

function fecha(value: string) {
  const parsed = new Date(value)
  return Number.isNaN(parsed.getTime()) ? '—' : new Intl.DateTimeFormat('es-CL', { dateStyle: 'long' }).format(parsed)
}

export default function ProfilePage() {
  const { usuario, cerrarSesion } = useAuth()
  const navigate = useNavigate()
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')

  async function salir() {
    setBusy(true)
    setError('')
    try {
      await cerrarSesion()
      navigate('/login?logout=1', { replace: true })
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No se pudo cerrar la sesión. Intenta nuevamente.')
      setBusy(false)
    }
  }

  if (!usuario) return null
  return (
    <AppShell active="perfil">
      <div className="page-heading"><div><div className="eyebrow">CUENTA Y ACCESO</div><h1>Mi perfil</h1><p>Información de la cuenta autenticada en MaintControl.</p></div><Link className="secondary-btn" to="/"><ArrowLeft size={16} /> Volver al catastro</Link></div>
      {error && <div className="error-banner"><AlertTriangle size={18} /><span>{error}</span></div>}
      <section className="profile-card" aria-labelledby="profile-heading">
        <div className="profile-summary">
          <div className="profile-avatar-large"><UserRound size={27} /></div>
          <div><div className="eyebrow">USUARIO AUTENTICADO</div><h2 id="profile-heading">{usuario.nombre}</h2><p>{usuario.correo || 'Correo no disponible en la cuenta'}</p></div>
          <span className="profile-badge"><BadgeCheck size={15} /> Perfil registrado</span>
        </div>
        <div className="profile-details">
          <ProfileDetail icon={<Hash size={17} />} label="ID de usuario" value={String(usuario.id)} />
          <ProfileDetail icon={<UserRound size={17} />} label="Nombre" value={usuario.nombre} />
          <ProfileDetail icon={<UserRound size={17} />} label="Nombre de usuario" value={usuario.username} />
          <ProfileDetail icon={<Mail size={17} />} label="Correo electrónico" value={usuario.correo || 'No informado'} />
          <ProfileDetail icon={<BadgeCheck size={17} />} label="Código de empleado" value={usuario.codigoEmpleado || 'No informado'} />
          <ProfileDetail icon={<BadgeCheck size={17} />} label="Rol de acceso" value={usuario.rol === 'USUARIO' ? 'Usuario' : usuario.rol} />
          <ProfileDetail icon={<CalendarDays size={17} />} label="Cuenta vinculada desde" value={fecha(usuario.creadoEn)} />
        </div>
        <div className="profile-actions">
          <div><strong>¿Terminaste tu trabajo?</strong><span>Al cerrar sesión tendrás que volver a autenticarte para acceder al catastro.</span></div>
          <div className="profile-action-buttons">
            {usuario.rol === 'ADMIN' && <Link className="primary-btn" to="/admin/usuarios"><UsersRound size={16} /> Gestionar usuarios</Link>}
            <button className="secondary-btn logout-btn" type="button" onClick={() => void salir()} disabled={busy}>
              <LogOut size={16} /> {busy ? 'Cerrando sesión…' : 'Cerrar sesión'}
            </button>
          </div>
        </div>
      </section>
    </AppShell>
  )
}

function ProfileDetail({ icon, label, value }: { icon: ReactNode; label: string; value: string }) {
  return <div className="profile-detail"><div className="profile-detail-icon">{icon}</div><div><span>{label}</span><strong>{value}</strong></div></div>
}
