import { getCurrentUser, saveSession } from '../utils/auth';
import { fetchWithAuth } from '../utils/fetchWithAuth';

export interface PerfilUsuario {
  id: number;
  nombre: string;
  apellido: string;
  correo: string;
  rol: string;
  telefono: string | null;
  carrera: string | null;
  especialidad: string | null;
}

export interface PerfilFormulario {
  nombre: string;
  apellido: string;
  telefono: string;
  carrera: string;
}

async function consultarPerfil(options?: RequestInit): Promise<PerfilUsuario> {
  const response = await fetchWithAuth('/perfil', options);
  if (!response.ok) {
    if (response.status === 404) throw new Error('El perfil no está disponible. Verifica que el backend esté actualizado y reiniciado.');
    if (response.status === 403) throw new Error('No tienes permisos para acceder al perfil.');
    const datos = await response.json().catch(() => null);
    throw new Error(datos?.error ?? 'No se pudo completar la operación del perfil. Inténtalo nuevamente.');
  }
  return response.json();
}

export function obtenerMiPerfil() {
  return consultarPerfil();
}

export async function guardarMiPerfil(datos: PerfilFormulario) {
  const perfil = await consultarPerfil({ method: 'PUT', body: JSON.stringify(datos) });
  const sesion = getCurrentUser();
  if (sesion && sesion.id === perfil.id) {
    saveSession({ ...sesion, nombre: perfil.nombre, apellido: perfil.apellido });
  }
  return perfil;
}
