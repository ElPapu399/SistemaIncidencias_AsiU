import { fetchWithAuth } from '../utils/fetchWithAuth';
import type { Laboratorio } from '../types/laboratorio';
import type { Equipo, EquipoEstadoFormulario, EquipoFormulario } from '../types/equipo';

interface LaboratorioDto {
  id: number;
  nombre: string;
  pabellon: string;
  piso: number;
  capacidad: number | null;
  encargadoId: number | null;
  encargado: string | null;
  estado: 'Operativo' | 'Mantenimiento' | null;
  cantidadPCs: number;
  cantidadEquipos: number;
}

export interface LaboratorioFormulario {
  nombre: string;
  pabellon: string;
  piso: number;
  capacidad: number | null;
  encargadoId: number | null;
  estado: 'Operativo' | 'Mantenimiento' | null;
}

async function consultar<T>(endpoint: string, options?: RequestInit): Promise<T> {
  const response = await fetchWithAuth(endpoint, options);
  if (!response.ok) {
    if (response.status === 403) throw new Error('Tu cuenta no tiene permisos para realizar esta operación.');
    const data = await response.json().catch(() => null);
    throw new Error(data?.error ?? 'No se pudo completar la operación. Verifica que el backend esté actualizado.');
  }
  return response.json();
}

function laboratorioDesdeDto(data: LaboratorioDto): Laboratorio {
  return { ...data, id: String(data.id), pisoNumero: data.piso,
    piso: data.piso === 0 ? 'Planta baja' : `${data.piso}° piso`,
    estado: data.estado ?? 'Sin definir', encargado: data.encargado ?? 'Sin registrar' };
}

export async function obtenerLaboratorios() {
  return (await consultar<LaboratorioDto[]>('/laboratorios')).map(laboratorioDesdeDto);
}

export async function obtenerLaboratorio(id: string) {
  return laboratorioDesdeDto(await consultar<LaboratorioDto>(`/laboratorios/${encodeURIComponent(id)}`));
}

export async function guardarLaboratorio(datos: LaboratorioFormulario, id?: string) {
  return laboratorioDesdeDto(await consultar<LaboratorioDto>(id ? `/laboratorios/${encodeURIComponent(id)}` : '/laboratorios', {
    method: id ? 'PUT' : 'POST', body: JSON.stringify(datos),
  }));
}

export function obtenerEncargadosLaboratorio() {
  return consultar<{ id: number; nombre: string }[]>('/laboratorios/encargados');
}

export function obtenerEquiposLaboratorio(id: string) {
  return consultar<Equipo[]>(`/equipos?ubicacionId=${encodeURIComponent(id)}`);
}

export function guardarEquipo(datos: EquipoFormulario, id?: number) {
  return consultar<Equipo>(id === undefined ? '/equipos' : `/equipos/${id}`, {
    method: id === undefined ? 'POST' : 'PUT', body: JSON.stringify(datos),
  });
}

export function cambiarEstadoEquipo(id: number, datos: EquipoEstadoFormulario) {
  return consultar<Equipo>(`/equipos/${id}/estado`, { method: 'PUT', body: JSON.stringify(datos) });
}
