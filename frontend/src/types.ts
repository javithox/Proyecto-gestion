export type EstadoEquipo = 'OPERATIVO' | 'DETENIDO' | 'EN_MANTENIMIENTO' | 'BAJA'
export type Criticidad = 'ALTA' | 'MEDIA' | 'BAJA'

export interface Equipo {
  id: number
  codigo: string
  nombre: string
  descripcion: string | null
  marca: string | null
  modelo: string | null
  numeroSerie: string | null
  fechaAdquisicion: string | null
  criticidad: Criticidad
  estado: EstadoEquipo
  ubicacion: string
  condicionesOperacion: string | null
  creadoEn: string
  actualizadoEn: string
}

export type EquipoInput = Omit<Equipo, 'id' | 'creadoEn' | 'actualizadoEn'>
