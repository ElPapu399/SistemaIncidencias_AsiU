import type { Incident } from '../types/incident';

const API_URL = 'http://localhost:8080/api/incidencias';

export async function obtenerIncidencias(): Promise<Incident[]> {
  const response = await fetch(API_URL);

  if (!response.ok) {
    throw new Error('Error al obtener las incidencias');
  }

  const data = await response.json();

  return data.map((incidencia: any): Incident => ({
    id: incidencia.codigoTicket,
    title: incidencia.titulo,
    description: incidencia.descripcion,

    category: convertirCategoria(incidencia.categoria?.nombre),

    priority: convertirPrioridad(incidencia.prioridad?.nivel),

    status: convertirEstado(incidencia.estado),

    reporter: incidencia.estudiante
      ? `${incidencia.estudiante.nombre} ${incidencia.estudiante.apellido}`
      : 'Sin estudiante',

    assignee: incidencia.tecnico
      ? `${incidencia.tecnico.nombre} ${incidencia.tecnico.apellido}`
      : 'Sin asignar',

    location: incidencia.ubicacion
      ? `${incidencia.ubicacion.pabellon} - ${incidencia.ubicacion.aulaLaboratorio}`
      : 'Sin ubicación',

    createdAt: incidencia.fechaCreacion,
    updatedAt: incidencia.fechaCreacion,

    action: undefined,
  }));
}

function convertirCategoria(nombre: string): Incident['category'] {
  const texto = nombre?.toLowerCase() ?? '';

  if (
    texto.includes('computadora') ||
    texto.includes('monitor') ||
    texto.includes('impresora')
  ) {
    return 'infraestructura';
  }

  if (
    texto.includes('internet') ||
    texto.includes('wi-fi') ||
    texto.includes('wifi') ||
    texto.includes('conexión')
  ) {
    return 'tecnologia';
  }

  if (
    texto.includes('aplicación') ||
    texto.includes('sistema operativo')
  ) {
    return 'tecnologia';
  }

  return 'servicios';
}

function convertirPrioridad(nivel: string): Incident['priority'] {
  switch (nivel?.toLowerCase()) {
    case 'urgente':
      return 'urgente';
    case 'alta':
      return 'alta';
    case 'media':
      return 'media';
    case 'baja':
      return 'baja';
    default:
      return 'media';
  }
}

function convertirEstado(estado: string): Incident['status'] {
  switch (estado?.toLowerCase()) {
    case 'pendiente':
      return 'pendiente';

    case 'en proceso':
      return 'en_proceso';

    case 'resuelto':
      return 'resuelta';

    case 'cerrado':
      return 'cerrada';

    default:
      return 'pendiente';
  }
}