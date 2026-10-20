import { Activity, Boxes, ClipboardList, Factory, Menu, UserRound, X } from 'lucide-react'
import { useEffect, useState } from 'react'
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
  const [menuOpen, setMenuOpen] = useState(false)
  const heading = active === 'perfil' ? 'Mi perfil' : 'Catastro de equipos'

  useEffect(() => {
    if (!menuOpen) return

    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setMenuOpen(false)
    }
    const closeOnDesktop = () => {
      if (window.matchMedia('(min-width: 1025px)').matches) setMenuOpen(false)
    }

    window.addEventListener('keydown', closeOnEscape)
    window.addEventListener('resize', closeOnDesktop)
    return () => {
      window.removeEventListener('keydown', closeOnEscape)
      window.removeEventListener('resize', closeOnDesktop)
    }
  }, [menuOpen])

  const closeMenu = () => setMenuOpen(false)

  return (
    <div className="app-shell">
      <aside id="primary-navigation" className={`sidebar ${menuOpen ? 'is-open' : ''}`}>
        <div className="brand"><div className="brand-icon"><Factory size={22} /></div><div><strong>Control Principal</strong><span>GESTIÓN INDUSTRIAL</span></div></div>
        <nav aria-label="Menú principal">
          <div className="nav-caption">MANTENIMIENTO</div>
          <Link className={`nav-item ${active === 'equipos' ? 'active' : ''}`} to="/" aria-current={active === 'equipos' ? 'page' : undefined} onClick={closeMenu}>
            <Boxes size={18} /><span>Catastro de equipos</span>{equipmentCount !== undefined && <span className="nav-count">{equipmentCount}</span>}
          </Link>
          <div className="nav-item disabled" aria-disabled="true"><ClipboardList size={18} /><span>Planes preventivos</span><span className="soon">Próximo</span></div>
          <div className="nav-item disabled" aria-disabled="true"><Activity size={18} /><span>Órdenes de trabajo</span><span className="soon">Próximo</span></div>
        </nav>
        <div className="sidebar-bottom"><div className="status-dot" /><div><strong>Sesión protegida</strong><span>Cuenta autenticada</span></div></div>
      </aside>

      <button className={`sidebar-backdrop ${menuOpen ? 'visible' : ''}`} type="button" aria-label="Cerrar menú" tabIndex={menuOpen ? 0 : -1} onClick={closeMenu} />

      <main className="main">
        <header className="topbar">
          <div className="topbar-start">
            <button
              className="menu-toggle"
              type="button"
              aria-label={menuOpen ? 'Cerrar menú' : 'Abrir menú'}
              aria-controls="primary-navigation"
              aria-expanded={menuOpen}
              onClick={() => setMenuOpen(open => !open)}
            >
              {menuOpen ? <X size={19} /> : <Menu size={19} />}
            </button>
            <div className="breadcrumb">Mantenimiento <span>/</span> <strong>{heading}</strong></div>
          </div>
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
