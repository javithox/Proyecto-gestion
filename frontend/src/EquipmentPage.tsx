import { useCallback, useEffect, useMemo, useState } from 'react'
import { Activity, AlertTriangle, Boxes, Check, ChevronDown, CirclePlus, ClipboardList, Factory, Filter, LoaderCircle, Pencil, Search, ShieldAlert, Trash2, X } from 'lucide-react'
import type { FormEvent, ReactNode } from 'react'
import { Link } from 'react-router-dom'
import { equiposApi } from './api'
import { useAuth } from './auth'
import type { Criticidad, Equipo, EquipoInput, EstadoEquipo } from './types'

const emptyForm: EquipoInput = {
  codigo: '', nombre: '', descripcion: '', marca: '', modelo: '', numeroSerie: '',
  fechaAdquisicion: '', criticidad: 'MEDIA', estado: 'OPERATIVO', ubicacion: '',
  condicionesOperacion: '',
}

const estados: { value: EstadoEquipo; label: string }[] = [
  { value: 'OPERATIVO', label: 'Operativo' },
  { value: 'DETENIDO', label: 'Detenido' },
  { value: 'EN_MANTENIMIENTO', label: 'En mantenimiento' },
  { value: 'BAJA', label: 'De baja' },
]
const criticidades: { value: Criticidad; label: string }[] = [
  { value: 'ALTA', label: 'Alta' }, { value: 'MEDIA', label: 'Media' }, { value: 'BAJA', label: 'Baja' },
]
const estadoLabel = (value: EstadoEquipo) => estados.find(x => x.value === value)?.label ?? value
const critLabel = (value: Criticidad) => criticidades.find(x => x.value === value)?.label ?? value

export default function EquipmentPage() {
  const { usuario } = useAuth()
  const [equipos, setEquipos] = useState<Equipo[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [q, setQ] = useState('')
  const [debouncedQ, setDebouncedQ] = useState('')
  const [estado, setEstado] = useState('')
  const [criticidad, setCriticidad] = useState('')
  const [modal, setModal] = useState(false)
  const [editing, setEditing] = useState<Equipo | null>(null)
  const [form, setForm] = useState<EquipoInput>(emptyForm)
  const [saving, setSaving] = useState(false)
  const [notice, setNotice] = useState('')
  const [refreshKey, setRefreshKey] = useState(0)

  useEffect(() => {
    const timer = window.setTimeout(() => setDebouncedQ(q.trim()), 300)
    return () => window.clearTimeout(timer)
  }, [q])

  const cargar = useCallback(async (signal: AbortSignal) => {
    setLoading(true); setError('')
    try {
      const params = new URLSearchParams()
      if (debouncedQ) params.set('q', debouncedQ)
      if (estado) params.set('estado', estado)
      if (criticidad) params.set('criticidad', criticidad)
      setEquipos(await equiposApi.listar(params, signal))
    } catch (e) {
      if (signal.aborted) return
      setError(e instanceof Error ? e.message : 'No fue posible cargar los equipos')
    } finally { if (!signal.aborted) setLoading(false) }
  }, [debouncedQ, estado, criticidad])

  useEffect(() => {
    const controller = new AbortController()
    void cargar(controller.signal)
    return () => controller.abort()
  }, [cargar, refreshKey])
  useEffect(() => {
    if (!notice) return
    const timer = window.setTimeout(() => setNotice(''), 3500)
    return () => window.clearTimeout(timer)
  }, [notice])

  const stats = useMemo(() => ({
    total: equipos.length,
    operativos: equipos.filter(e => e.estado === 'OPERATIVO').length,
    alta: equipos.filter(e => e.criticidad === 'ALTA' && e.estado !== 'BAJA').length,
    detenidos: equipos.filter(e => e.estado === 'DETENIDO' || e.estado === 'EN_MANTENIMIENTO').length,
  }), [equipos])

  function abrirNuevo() { setEditing(null); setForm({ ...emptyForm }); setModal(true) }
  function abrirEdicion(e: Equipo) {
    setEditing(e)
    setForm({
      codigo: e.codigo, nombre: e.nombre, descripcion: e.descripcion ?? '', marca: e.marca ?? '',
      modelo: e.modelo ?? '', numeroSerie: e.numeroSerie ?? '', fechaAdquisicion: e.fechaAdquisicion ?? '',
      criticidad: e.criticidad, estado: e.estado, ubicacion: e.ubicacion,
      condicionesOperacion: e.condicionesOperacion ?? '',
    })
    setModal(true)
  }

  async function guardar(event: FormEvent<HTMLFormElement>) {
    event.preventDefault(); setSaving(true); setError('')
    try {
      const payload: EquipoInput = {
        ...form,
        codigo: form.codigo.trim().toUpperCase(),
        nombre: form.nombre.trim(),
        ubicacion: form.ubicacion.trim(),
        descripcion: form.descripcion?.trim() || null,
        marca: form.marca?.trim() || null,
        modelo: form.modelo?.trim() || null,
        numeroSerie: form.numeroSerie?.trim() || null,
        fechaAdquisicion: form.fechaAdquisicion || null,
        condicionesOperacion: form.condicionesOperacion?.trim() || null,
      }
      if (editing) await equiposApi.actualizar(editing.id, payload)
      else await equiposApi.crear(payload)
      setModal(false); setNotice(editing ? 'Equipo actualizado correctamente' : 'Equipo registrado correctamente')
      setRefreshKey(value => value + 1)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'No fue posible guardar el equipo')
    } finally { setSaving(false) }
  }

  async function darDeBaja(e: Equipo) {
    if (!window.confirm(`¿Dar de baja el equipo ${e.codigo}? El registro se conservará en la base de datos.`)) return
    try {
      await equiposApi.baja(e.id); setNotice(`Equipo ${e.codigo} dado de baja`); setRefreshKey(value => value + 1)
    } catch (err) { setError(err instanceof Error ? err.message : 'No fue posible dar de baja el equipo') }
  }

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <div className="brand"><div className="brand-icon"><Factory size={22}/></div><div><strong>MaintControl</strong><span>GESTIÓN INDUSTRIAL</span></div></div>
        <div className="nav-caption">MANTENIMIENTO</div>
        <div className="nav-item active"><Boxes size={18}/><span>Catastro de equipos</span><span className="nav-count">{equipos.length}</span></div>
        <div className="nav-item disabled"><ClipboardList size={18}/><span>Planes preventivos</span><span className="soon">Próximo</span></div>
        <div className="nav-item disabled"><Activity size={18}/><span>Órdenes de trabajo</span><span className="soon">Próximo</span></div>
        <div className="sidebar-bottom"><div className="status-dot"/><div><strong>Sesión protegida</strong><span>Cuenta autenticada</span></div></div>
      </aside>

      <main className="main">
        <header className="topbar"><div className="breadcrumb">Mantenimiento <span>/</span> <strong>Catastro de equipos</strong></div><div className="top-right"><span className="environment"><span/> Sesión activa</span><Link to="/perfil" className="avatar profile-link" aria-label={`Abrir perfil de ${usuario?.nombre ?? 'usuario'}`} title="Mi perfil">{initials(usuario?.nombre ?? '')}</Link></div></header>
        <section className="content">
          <div className="page-heading"><div><div className="eyebrow">GESTIÓN DE ACTIVOS</div><h1>Catastro de equipos</h1><p>Administra los activos de la línea principal de producción.</p></div><button className="primary-btn" onClick={abrirNuevo}><CirclePlus size={18}/> Registrar equipo</button></div>

          {notice && <div className="notice"><Check size={17}/>{notice}<button aria-label="Cerrar aviso" onClick={() => setNotice('')}><X size={16}/></button></div>}
          {error && <div className="error-banner"><AlertTriangle size={18}/><span>{error}</span><button onClick={() => setRefreshKey(value => value + 1)}>Reintentar</button></div>}

          <div className="stats-grid">
            <Stat icon={<Boxes/>} label="Equipos encontrados" value={stats.total} note="Según filtros actuales" color="teal"/>
            <Stat icon={<Check/>} label="Operativos" value={stats.operativos} note="Disponibles para operar" color="green"/>
            <Stat icon={<ShieldAlert/>} label="Criticidad alta" value={stats.alta} note="Requieren mayor atención" color="orange"/>
            <Stat icon={<AlertTriangle/>} label="Detenidos / mantenimiento" value={stats.detenidos} note="Fuera de operación normal" color="red"/>
          </div>

          <section className="panel">
            <div className="panel-heading"><div><h2>Inventario de activos</h2><p>Listado de equipos registrados en la planta.</p></div><button className="secondary-btn" onClick={() => { setQ(''); setEstado(''); setCriticidad('') }}><Filter size={16}/> Limpiar filtros</button></div>
            <div className="filters">
              <label className="search-box"><Search size={18}/><input value={q} onChange={e => setQ(e.target.value)} placeholder="Buscar por código, nombre, marca o ubicación…"/></label>
              <label className="select-box"><span>Estado</span><select value={estado} onChange={e => setEstado(e.target.value)}><option value="">Todos los estados</option>{estados.map(x => <option key={x.value} value={x.value}>{x.label}</option>)}</select><ChevronDown size={15}/></label>
              <label className="select-box"><span>Criticidad</span><select value={criticidad} onChange={e => setCriticidad(e.target.value)}><option value="">Todas</option>{criticidades.map(x => <option key={x.value} value={x.value}>{x.label}</option>)}</select><ChevronDown size={15}/></label>
            </div>
            <div className="table-wrap">
              <table><thead><tr><th>Equipo</th><th>Ubicación</th><th>Criticidad</th><th>Estado</th><th>Marca / Modelo</th><th>Acciones</th></tr></thead>
                <tbody>
                  {loading ? <tr><td colSpan={6} className="empty"><LoaderCircle className="spin" size={24}/><span>Cargando inventario…</span></td></tr>
                  : equipos.length === 0 ? <tr><td colSpan={6} className="empty"><Boxes size={28}/><strong>No hay equipos para mostrar</strong><span>Registra un equipo o modifica los filtros.</span></td></tr>
                  : equipos.map(e => <tr key={e.id}>
                    <td><div className="asset-cell"><div className="asset-icon"><Factory size={18}/></div><div><strong>{e.nombre}</strong><span>{e.codigo}</span></div></div></td>
                    <td><span className="location">{e.ubicacion}</span></td>
                    <td><span className={`pill critical-${e.criticidad.toLowerCase()}`}><span/>{critLabel(e.criticidad)}</span></td>
                    <td><span className={`pill status-${e.estado.toLowerCase()}`}><span/>{estadoLabel(e.estado)}</span></td>
                    <td><div className="make-model">{e.marca || '—'}<span>{e.modelo || 'Sin modelo'}</span></div></td>
                    <td><div className="actions"><button title="Editar equipo" aria-label={`Editar ${e.codigo}`} onClick={() => abrirEdicion(e)}><Pencil size={16}/></button><button title="Dar de baja" aria-label={`Dar de baja ${e.codigo}`} onClick={() => void darDeBaja(e)} disabled={e.estado === 'BAJA'}><Trash2 size={16}/></button></div></td>
                  </tr>)}
                </tbody>
              </table>
            </div>
            <div className="table-footer"><span>{equipos.length} registro(s)</span><span>Los datos se guardan en PostgreSQL</span></div>
          </section>
          <footer>Catastro de equipos <span>•</span> MVP de mantenimiento industrial</footer>
        </section>
      </main>

      {modal && <div className="modal-backdrop" role="presentation" onMouseDown={e => { if (e.target === e.currentTarget) setModal(false) }}>
        <section className="modal" role="dialog" aria-modal="true" aria-labelledby="modal-title">
          <div className="modal-header"><div><div className="eyebrow">{editing ? 'ACTUALIZACIÓN DE ACTIVO' : 'NUEVO ACTIVO'}</div><h2 id="modal-title">{editing ? 'Editar equipo' : 'Registrar equipo'}</h2><p>Completa los datos técnicos y operacionales.</p></div><button className="icon-btn" onClick={() => setModal(false)} aria-label="Cerrar"><X/></button></div>
          <form onSubmit={guardar}>
            <div className="form-grid">
              <Field label="Código del equipo *"><input required maxLength={30} value={form.codigo} onChange={e => setForm({...form, codigo:e.target.value})} placeholder="Ej. EQ-001"/></Field>
              <Field label="Nombre del equipo *"><input required maxLength={120} value={form.nombre} onChange={e => setForm({...form, nombre:e.target.value})} placeholder="Ej. Cinta transportadora"/></Field>
              <Field label="Ubicación *"><input required maxLength={180} value={form.ubicacion} onChange={e => setForm({...form, ubicacion:e.target.value})} placeholder="Línea principal / Envasado"/></Field>
              <Field label="Criticidad *"><select required value={form.criticidad} onChange={e => setForm({...form, criticidad:e.target.value as Criticidad})}>{criticidades.map(x=><option key={x.value} value={x.value}>{x.label}</option>)}</select></Field>
              <Field label="Estado *"><select required value={form.estado} onChange={e => setForm({...form, estado:e.target.value as EstadoEquipo})}>{estados.map(x=><option key={x.value} value={x.value}>{x.label}</option>)}</select></Field>
              <Field label="Marca"><input maxLength={100} value={form.marca ?? ''} onChange={e => setForm({...form, marca:e.target.value})} placeholder="Fabricante"/></Field>
              <Field label="Modelo"><input maxLength={100} value={form.modelo ?? ''} onChange={e => setForm({...form, modelo:e.target.value})} placeholder="Modelo"/></Field>
              <Field label="Número de serie"><input maxLength={100} value={form.numeroSerie ?? ''} onChange={e => setForm({...form, numeroSerie:e.target.value})} placeholder="N.º de serie"/></Field>
              <Field label="Fecha de adquisición"><input type="date" value={form.fechaAdquisicion ?? ''} onChange={e => setForm({...form, fechaAdquisicion:e.target.value})}/></Field>
              <Field label="Descripción" wide><textarea rows={2} maxLength={1000} value={form.descripcion ?? ''} onChange={e => setForm({...form, descripcion:e.target.value})} placeholder="Función del equipo en la línea…"/></Field>
              <Field label="Condiciones de operación" wide><textarea rows={2} maxLength={1000} value={form.condicionesOperacion ?? ''} onChange={e => setForm({...form, condicionesOperacion:e.target.value})} placeholder="Turnos, temperatura, limpieza, condiciones relevantes…"/></Field>
            </div>
            <div className="form-note">Los campos marcados con * son obligatorios.</div>
            <div className="modal-actions"><button type="button" className="secondary-btn" onClick={() => setModal(false)}>Cancelar</button><button className="primary-btn" type="submit" disabled={saving}>{saving ? <LoaderCircle className="spin" size={17}/> : <Check size={17}/>} {saving ? 'Guardando…' : editing ? 'Guardar cambios' : 'Registrar equipo'}</button></div>
          </form>
        </section>
      </div>}
    </div>
  )
}

function initials(name: string) { return name.trim().split(/\s+/).slice(0, 2).map(part => part[0]).join('').toUpperCase() || 'U' }
function Stat({ icon, label, value, note, color }: { icon: ReactNode; label: string; value: number; note: string; color: string }) {
  return <div className="stat-card"><div className={`stat-icon ${color}`}>{icon}</div><div className="stat-label">{label}</div><div className="stat-value">{value}</div><div className="stat-note">{note}</div></div>
}
function Field({ label, children, wide = false }: { label: string; children: ReactNode; wide?: boolean }) {
  return <label className={`field ${wide ? 'wide' : ''}`}><span>{label}</span>{children}</label>
}
