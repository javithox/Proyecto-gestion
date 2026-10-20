import { Activity, Boxes, ClipboardList, Factory, UserRound } from 'lucide-react'
import type { ReactNode } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from './auth'

type Props = {
  active: 'equipos' | 'perfil'
  children: ReactNode
  equipmentCount?: number
}

function initials(name: string) {
  return name.trim().split(/\s+/).slice(0, 2).map(part => part[0]).join('').toUpperCase() || 'U'
}

export default function AppShell({ active, children, equipmentCount }: Props) {
  const { usuario } = useAuth()
  const heading = active === 'perfil' ? 'Mi perfil' : 'Catastro de equipos'
  return (
    <div className="app-shell">
      <aside className="sidebar">
        <div className="brand"><div className="brand-icon"><Factory size={22} /></div><div><strong>Panel de control</strong><span>GESTIÓN INDUSTRIAL</span></div></div>
        <div className="nav-caption">MANTENIMIENTO</div>
        <Link className={`nav-item ${active === 'equipos' ? 'active' : ''}`} to="/" aria-current={active === 'equipos' ? 'page' : undefined}>
          <Boxes size={18} /><span>Catastro de equipos</span>{equipmentCount !== undefined && <span className="nav-count">{equipmentCount}</span>}
        </Link>
        <div className="nav-item disabled" aria-disabled="true"><ClipboardList size={18} /><span>Planes preventivos</span><span className="soon">Próximo</span></div>
        <div className="nav-item disabled" aria-disabled="true"><Activity size={18} /><span>Órdenes de trabajo</span><span className="soon">Próximo</span></div>
        <div className="sidebar-bottom"><div className="status-dot" /><div><strong>Sesión protegida</strong><span>Cuenta autenticada</span></div></div>
      </aside>
      <main className="main">
        <header className="topbar">
          <div className="breadcrumb">Mantenimiento <span>/</span> <strong>{heading}</strong></div>
          <div className="top-right">
            <span className="environment"><span /> Sesión activa</span>
            <Link className="profile-link" to="/perfil" aria-label={`Abrir perfil de ${usuario?.nombre ?? 'usuario'}`} title="Mi perfil">
              {usuario ? initials(usuario.nombre) : <UserRound size={16} />}
            </Link>
          </div>
        </header>
        <div className="content">{children}</div>
      </main>
    </div>
  )
}
