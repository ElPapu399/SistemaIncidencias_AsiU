import type { Incident } from '../types/incident';

const RESOLVED_STATUSES = new Set(['Resuelta', 'Resuelto', 'Cerrada']);

export function calcularMetricasReportes(incidents: Incident[]) {
  let resueltas = 0;
  let altaPrioridad = 0;
  let sinAsignar = 0;
  let duracionTotalHoras = 0;
  let incidenciasConTiempo = 0;
  let sumaCalificaciones = 0;
  let evaluaciones = 0;

  for (const incident of incidents) {
    const resuelta = RESOLVED_STATUSES.has(incident.status);
    const activa = !resuelta && incident.status !== 'Cancelado';
    if (resuelta) {
      resueltas++;
      if (incident.createdAt && incident.closedAt) {
        const duracion = Date.parse(incident.closedAt) - Date.parse(incident.createdAt);
        if (Number.isFinite(duracion) && duracion >= 0) {
          duracionTotalHoras += duracion / 3_600_000;
          incidenciasConTiempo++;
        }
      }
    }
    if (activa && incident.priority === 'Alta') altaPrioridad++;
    if (activa && !incident.assigneeId) sinAsignar++;
    const calificacion = incident.calificacion;
    if (typeof calificacion === 'number' && Number.isInteger(calificacion) && calificacion >= 1 && calificacion <= 5) {
      sumaCalificaciones += calificacion;
      evaluaciones++;
    }
  }

  return {
    tasaResolucion: incidents.length > 0 ? Math.round(resueltas / incidents.length * 100) : 0,
    resueltas,
    tiempoPromedioHoras: incidenciasConTiempo > 0 ? duracionTotalHoras / incidenciasConTiempo : null,
    incidenciasConTiempo,
    altaPrioridad,
    sinAsignar,
    satisfaccion: evaluaciones > 0 ? sumaCalificaciones / evaluaciones : null,
    evaluaciones,
  };
}
