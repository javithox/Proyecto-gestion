import { useCallback, useEffect, useState, type FormEvent } from 'react'
import { AlertTriangle, ArrowLeft, Check, LoaderCircle, Pencil, Plus, RefreshCw, ShieldCheck, Trash2, UsersRound, X } from 'lucide-react'
import { Link, Navigate } from 'react-router-dom'
import AppShell from '../AppShell'
import { ApiError, usuariosAdminApi } from '../api'
import { useAuth } from '../auth/auth'
import type { UsuarioAdminInput, UsuarioPerfil } from '../types'

const emptyForm: UsuarioAdminInput = { username: '', nombre: '', correo: '', codigoEmpleado: '', password: '' }

export default function AdminUsersPage() {
  const { usuario } = useAuth()
  const [users, setUsers] = useState<UsuarioPerfil[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [notice, setNotice] = useState('')
  const [editing, setEditing] = useState<UsuarioPerfil | null>(null)
  const [form, setForm] = useState<UsuarioAdminInput>(emptyForm)
  const [modal, setModal] = useState(false)
  const [deleteTarget, setDeleteTarget] = useState<UsuarioPerfil | null>(null)
  const [deleteBusy, setDeleteBusy] = useState(false)
  const [deleteError, setDeleteError] = useState('')

  const loadUsers = useCallback(async () => {
    setLoading(true)
    setError('')
    try { setUsers(await usuariosAdminApi.listar()) }
    catch (e) { setError(e instanceof Error ? e.message : 'No se pudo cargar la lista de usuarios.') }
    finally { setLoading(false) }
  }, [])

  useEffect(() => { void loadUsers() }, [loadUsers])

  if (!usuario) return <Navigate to="/login" replace />
  if (usuario.rol !== 'ADMIN') return <Navigate to="/" replace />

  function openCreate() {
    setEditing(null)
    setForm(emptyForm)
    setError('')
    setNotice('')
    setModal(true)
  }

  function openEdit(user: UsuarioPerfil) {
    setEditing(user)
    setForm({ username: user.username, nombre: user.nombre, correo: user.correo ?? '', codigoEmpleado: user.codigoEmpleado ?? '', password: '' })
    setError('')
    setNotice('')
    setModal(true)
  }

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setSaving(true)
    setError('')
    setNotice('')
    const payload: UsuarioAdminInput = {
      ...form,
      username: form.username.trim(),
      nombre: form.nombre.trim(),
      correo: form.correo?.trim() || null,
      codigoEmpleado: form.codigoEmpleado?.trim() || null,
      password: form.password,
    }
    try {
      if (editing) await usuariosAdminApi.actualizar(editing.id, payload)
      else await usuariosAdminApi.crear(payload)
      setModal(false)
      setNotice(editing ? 'Los datos del usuario se actualizaron correctamente.' : 'El usuario se registró correctamente.')
      await loadUsers()
    } catch (e) {
      const message = e instanceof ApiError || e instanceof Error ? e.message : 'No se pudo guardar el usuario.'
      setError(message)
    } finally { setSaving(false) }
  }

  function requestDelete(user: UsuarioPerfil) {
    setDeleteError('')
    setDeleteTarget(user)
  }

  async function confirmDelete() {
    if (!deleteTarget || deleteBusy) return
    const target = deleteTarget
    setDeleteBusy(true)
    setDeleteError('')
    setNotice('')
    try {
      await usuariosAdminApi.eliminar(target.id)
      setUsers(current => current.filter(item => item.id !== target.id))
      setNotice(`La cuenta ${target.username} y sus sesiones activas fueron eliminadas.`)
      setDeleteTarget(null)
    } catch (e) {
      setDeleteError(e instanceof Error ? e.message : 'No se pudo eliminar el usuario. Intenta nuevamente.')
    } finally {
      setDeleteBusy(false)
    }
  }

  return (
    <AppShell active="perfil">
      <div className="page-heading">
        <div><div className="eyebrow">ADMINISTRACIÓN Y ACCESO</div><h1>Gestión de usuarios</h1><p>Registra, edita o elimina cuentas de acceso al catastro.</p></div>
        <Link className="secondary-btn" to="/perfil"><ArrowLeft size={16} /> Volver al perfil</Link>
      </div>
      {error && <div className="error-banner"><AlertTriangle size={18}/><span>{error}</span><button type="button" onClick={() => setError('')}>Cerrar</button></div>}
      {notice && <div className="notice"><Check size={17}/><span>{notice}</span><button type="button" onClick={() => setNotice('')} aria-label="Cerrar aviso"><X size={15}/></button></div>}
      <section className="panel">
        <div className="panel-heading">
          <div><h2><UsersRound size={17} style={{verticalAlign:'-3px', marginRight:8}}/>Usuarios registrados</h2><p>Las cuentas normales no pueden acceder a esta pantalla ni a su API.</p></div>
          <div className="admin-toolbar">
            <button className="secondary-btn" type="button" onClick={() => void loadUsers()} disabled={loading}><RefreshCw size={15}/> Actualizar</button>
            <button className="primary-btn" type="button" onClick={openCreate}><Plus size={16}/> Registrar usuario</button>
          </div>
        </div>
        {loading ? <div className="admin-loading"><LoaderCircle className="spin" size={22}/> Cargando usuarios…</div> :
          <div className="table-wrap"><table className="admin-users-table">
            <thead><tr><th>USUARIO</th><th>NOMBRE</th><th>CORREO</th><th>ROL</th><th>ACCIONES</th></tr></thead>
            <tbody>{users.map(user => {
              const protectedAdmin = user.rol === 'ADMIN'
              return <tr key={user.id}>
                <td><strong>{user.username}</strong>{protectedAdmin && <span className="admin-protected"><ShieldCheck size={12}/> Protegida</span>}</td>
                <td>{user.nombre}</td><td>{user.correo || '—'}</td><td><span className={`user-role ${protectedAdmin ? 'admin' : ''}`}>{user.rol}</span></td>
                <td><div className="actions">
                  <button type="button" title={protectedAdmin ? 'Cuenta administradora protegida' : 'Editar usuario'} aria-label={`Editar ${user.username}`} disabled={protectedAdmin} onClick={() => openEdit(user)}><Pencil size={14}/></button>
                  <button type="button" title={protectedAdmin ? 'No se puede eliminar al administrador' : 'Eliminar usuario'} aria-label={`Eliminar ${user.username}`} disabled={protectedAdmin} onClick={() => requestDelete(user)}><Trash2 size={14}/></button>
                </div></td>
              </tr>
            })}</tbody>
          </table>{users.length === 0 && <div className="admin-loading">No hay usuarios registrados.</div>}</div>}
        <div className="table-footer"><span>{users.length} cuenta(s)</span><span><ShieldCheck size={12} style={{verticalAlign:'-2px'}}/> Acceso exclusivo de administrador</span></div>
      </section>
      {modal && <div className="modal-backdrop" role="presentation" onMouseDown={event => { if (event.target === event.currentTarget && !saving) setModal(false) }}>
        <section className="modal admin-user-modal" role="dialog" aria-modal="true" aria-labelledby="user-modal-title">
          <div className="modal-header"><div><div className="eyebrow">{editing ? 'EDITAR CUENTA' : 'NUEVA CUENTA'}</div><h2 id="user-modal-title">{editing ? 'Editar usuario' : 'Registrar usuario'}</h2><p>{editing ? 'Deja la contraseña vacía para conservar la actual.' : 'La nueva cuenta tendrá permisos de usuario estándar.'}</p></div><button type="button" className="icon-btn" onClick={() => setModal(false)} disabled={saving} aria-label="Cerrar"><X/></button></div>
          <form onSubmit={event => void submit(event)}>
            <div className="form-grid">
              <label className="field"><span>Nombre de usuario *</span><input required minLength={3} maxLength={80} autoComplete="off" value={form.username} onChange={e => setForm({...form, username:e.target.value})}/></label>
              <label className="field"><span>Nombre completo *</span><input required maxLength={160} value={form.nombre} onChange={e => setForm({...form, nombre:e.target.value})}/></label>
              <label className="field"><span>Correo electrónico</span><input type="email" maxLength={320} value={form.correo ?? ''} onChange={e => setForm({...form, correo:e.target.value})}/></label>
              <label className="field"><span>Código de empleado</span><input maxLength={60} value={form.codigoEmpleado ?? ''} onChange={e => setForm({...form, codigoEmpleado:e.target.value})}/></label>
              <label className="field wide"><span>{editing ? 'Nueva contraseña (opcional)' : 'Contraseña inicial *'}</span><input type="password" autoComplete="new-password" required={!editing} minLength={12} maxLength={72} value={form.password} onChange={e => setForm({...form, password:e.target.value})} placeholder={editing ? 'Dejar vacía para no cambiarla' : 'Mínimo 12 caracteres'}/></label>
            </div>
            <div className="form-note">La cuenta administradora no se puede modificar ni eliminar desde esta pantalla.</div>
            <div className="modal-actions"><button type="button" className="secondary-btn" onClick={() => setModal(false)} disabled={saving}>Cancelar</button><button className="primary-btn" type="submit" disabled={saving}>{saving ? <LoaderCircle className="spin" size={16}/> : <Check size={16}/>} {saving ? 'Guardando…' : editing ? 'Guardar cambios' : 'Crear usuario'}</button></div>
          </form>
        </section>
      </div>}
      {deleteTarget && <div className="modal-backdrop delete-confirm-backdrop" role="presentation" onMouseDown={event => { if (event.target === event.currentTarget && !deleteBusy) setDeleteTarget(null) }}>
        <section className="modal delete-confirm-modal" role="alertdialog" aria-modal="true" aria-labelledby="delete-user-title" aria-describedby="delete-user-description">
          <div className="modal-header delete-confirm-header">
            <div className="delete-confirm-icon"><Trash2 size={21}/></div>
            <div className="delete-confirm-heading"><div className="eyebrow">CONFIRMACIÓN DE ACCIÓN</div><h2 id="delete-user-title">¿Eliminar usuario?</h2></div>
            <button type="button" className="icon-btn" onClick={() => setDeleteTarget(null)} disabled={deleteBusy} aria-label="Cerrar confirmación"><X/></button>
          </div>
          <div className="delete-confirm-body">
            <p id="delete-user-description">Vas a eliminar la cuenta <strong>{deleteTarget.username}</strong> ({deleteTarget.nombre}). Esta acción no se puede deshacer y también cerrará sus sesiones activas.</p>
            {deleteError && <div className="delete-confirm-error" role="alert"><AlertTriangle size={16}/><span>{deleteError}</span></div>}
          </div>
          <div className="modal-actions delete-confirm-actions">
            <button type="button" className="secondary-btn" autoFocus onClick={() => setDeleteTarget(null)} disabled={deleteBusy}>Cancelar</button>
            <button type="button" className="danger-btn" onClick={() => void confirmDelete()} disabled={deleteBusy}>
              {deleteBusy ? <LoaderCircle className="spin" size={16}/> : <Trash2 size={16}/>}
              {deleteBusy ? 'Eliminando…' : 'Sí, eliminar usuario'}
            </button>
          </div>
        </section>
      </div>}
    </AppShell>
  )
}
