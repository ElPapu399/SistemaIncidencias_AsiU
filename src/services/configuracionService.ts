import type { Categoria, Prioridad } from '../types/incident';
import { fetchWithAuth } from '../utils/fetchWithAuth';

export interface EspecialidadCatalogo {
  id: number;
  nombre: string;
  descripcion?: string | null;
}

export interface EspecialidadFormulario {
  nombre: string;
  descripcion: string;
}

export interface CategoriaConfiguracion extends Categoria {
  ticketsVinculados: number;
}

export interface CategoriaFormulario {
  nombre: string;
  especialidadId: number;
  prioridadDefectoId: number;
}

async function consultar<T>(endpoint: string, options?: RequestInit): Promise<T> {
  const response = await fetchWithAuth(endpoint, options);
  if (!response.ok) {
    if (response.status === 403) {
      throw new Error('Tu cuenta no tiene permisos para acceder a esta opción.');
    }
    if (response.status === 404) {
      throw new Error('Esta opción no está disponible en el servidor. Verifica que el backend esté actualizado y reiniciado.');
    }
    const data = await response.json().catch(() => null);
    throw new Error(data?.error ?? 'No se pudo completar la operación. Inténtalo de nuevo.');
  }
  return response.json();
}

export async function obtenerCatalogoConfiguracion() {
  const [categorias, especialidades, prioridades] = await Promise.all([
    consultar<CategoriaConfiguracion[]>('/categorias/configuracion'),
    consultar<EspecialidadCatalogo[]>('/especialidades'),
    consultar<Prioridad[]>('/prioridades'),
  ]);
  return { categorias, especialidades, prioridades };
}

export function guardarCategoria(data: CategoriaFormulario, id?: number) {
  return consultar<CategoriaConfiguracion>(id === undefined ? '/categorias' : `/categorias/${id}`, {
    method: id === undefined ? 'POST' : 'PUT',
    body: JSON.stringify(data),
  });
}

export function obtenerEstadosSistema() {
  return consultar<string[]>('/estados');
}

export function obtenerEspecialidades() {
  return consultar<EspecialidadCatalogo[]>('/especialidades');
}

export function guardarEspecialidad(data: EspecialidadFormulario, id?: number) {
  return consultar<EspecialidadCatalogo>(id === undefined ? '/especialidades' : `/especialidades/${id}`, {
    method: id === undefined ? 'POST' : 'PUT',
    body: JSON.stringify(data),
  });
}
