export const ESTADOS_EQUIPO = ['Operativo', 'En reparación', 'Mantenimiento', 'Dado de baja'] as const;
export type EstadoEquipo = typeof ESTADOS_EQUIPO[number];

export interface Equipo {
  id: number;
  codigo: string;
  tipo: string;
  marca: string | null;
  modelo: string | null;
  ubicacionId: number;
  ubicacionTexto: string | null;
  estado: string;
  numeroSerie: string | null;
  fechaAdquisicion: string | null;
}

export interface EquipoFormulario {
  codigo: string;
  tipo: string;
  marca: string;
  modelo: string;
  numeroSerie: string;
  fechaAdquisicion: string | null;
  ubicacionId: number;
}

export interface EquipoEstadoFormulario {
  estado: EstadoEquipo;
  motivo: string;
}
