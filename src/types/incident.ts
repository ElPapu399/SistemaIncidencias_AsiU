export type IncidentPriority = 'baja' | 'media' | 'alta' | 'urgente';
export type IncidentStatus = 'pendiente' | 'en_proceso' | 'resuelta' | 'cerrada';
export type IncidentCategory =
  | 'infraestructura'
  | 'tecnologia'
  | 'academico'
  | 'servicios'
  | 'seguridad';

export interface Incident {
  id: string;
  title: string;
  description: string;
  category: IncidentCategory;
  priority: IncidentPriority;
  status: IncidentStatus;
  reporter: string;
  assignee: string;
  location: string;
  createdAt: string;
  updatedAt: string;
  action?: string;
}

export interface DashboardStats {
  total: number;
  pending: number;
  inProgress: number;
  resolved: number;
  urgent: number;
}
