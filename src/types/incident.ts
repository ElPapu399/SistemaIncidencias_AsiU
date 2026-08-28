export type IncidentPriority = 'Alta' | 'Media' | 'Baja';
export type IncidentStatus = 'Pendiente' | 'En Proceso' | 'Resuelto' | 'Cancelado';

export interface DashboardStats {
  total: number;
  pending: number;
  inProgress: number;
  resolved: number;
  urgent: number;
}

export interface Incident {
  id: string; // codigoTicket ej: "INC-2026-0001"
  numericId?: number;
  title: string;
  description: string;
  category: string;
  especialidad?: string;
  priority: IncidentPriority;
  status: IncidentStatus;
  reporter: string;
  reporterId?: number;
  assignee: string;
  assigneeId?: number | null;
  location: string;
  locationId?: number;
  solucionTecnica?: string | null;
  createdAt: string;
  startedAt?: string | null;
  closedAt?: string | null;
  updatedAt?: string;
}

export interface Categoria {
  id: number;
  nombre: string;
  especialidad?: {
    id: number;
    nombre: string;
    descripcion: string;
  };
  prioridadDefecto?: {
    id: number;
    nivel: IncidentPriority;
    tiempoMaximoHoras: number;
  };
}

export interface Ubicacion {
  id: number;
  pabellon: string;
  aulaLaboratorio: string;
  piso: number;
  tipo: string;
}

export interface Prioridad {
  id: number;
  nivel: IncidentPriority;
  tiempoMaximoHoras: number;
  descripcion?: string;
}

export interface Tecnico {
  id: number;
  nombre: string;
  apellido: string;
  correo: string;
  especialidad: string | null;
  incidenciasActivas: number;
}

export interface CreateIncidentData {
  titulo: string;
  descripcion: string;
  categoriaId: number;
  prioridadId: number;
  ubicacionId: number;
  estudianteId: number;
}
