import type { Incident, Tecnico } from '../types/incident';

export interface ReportChartItem {
  label: string;
  count: number;
  color: string;
}

export interface ReportMonth {
  key: string;
  label: string;
  fullLabel: string;
  count: number;
}

export interface TechnicianPerformance {
  id: number;
  nombre: string;
  total: number;
  resueltas: number;
  porcentaje: number;
}

const TIME_ZONE = 'America/Lima';
const yearMonth = new Intl.DateTimeFormat('en', { timeZone: TIME_ZONE, year: 'numeric', month: '2-digit' });
const STATE_COLORS: Record<string, string> = {
  Pendiente: '#94a3b8', Asignada: '#fbbf24', 'En atención': '#3b82f6',
  Resuelta: '#10b981', Cerrada: '#9ca3af',
};
const LEGACY_STATES: Record<string, string> = { 'En Proceso': 'En atención', Resuelto: 'Resuelta' };
const RESOLVED_STATES = new Set(['Resuelta', 'Resuelto', 'Cerrada']);

function monthKey(date: Date) {
  const parts = yearMonth.formatToParts(date);
  return `${parts.find((part) => part.type === 'year')!.value}-${parts.find((part) => part.type === 'month')!.value}`;
}

function fechaRegistro(value: string) {
  // El backend entrega LocalDateTime sin zona; esos valores corresponden a Lima.
  const localDateTime = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}(?::\d{2}(?:\.\d+)?)?$/;
  return new Date(localDateTime.test(value) ? `${value}-05:00` : value);
}

export function calcularGraficosReportes(incidents: Incident[], estados: string[], tecnicos: Tecnico[], now = new Date()) {
  const currentKey = monthKey(now);
  const [year, month] = currentKey.split('-').map(Number);
  const meses: ReportMonth[] = Array.from({ length: 6 }, (_, index) => {
    const date = new Date(Date.UTC(year, month - 6 + index, 15, 12));
    return {
      key: monthKey(date),
      label: new Intl.DateTimeFormat('es-PE', { timeZone: TIME_ZONE, month: 'short', year: '2-digit' }).format(date),
      fullLabel: new Intl.DateTimeFormat('es-PE', { timeZone: TIME_ZONE, month: 'long', year: 'numeric' }).format(date),
      count: 0,
    };
  });
  const mesesPorClave = new Map(meses.map((mes) => [mes.key, mes]));
  const categorias = new Map<string, number>();
  const conteosEstados = new Map<string, number>(estados.map((estado) => [estado, 0]));
  const rendimiento = new Map<number, TechnicianPerformance>(tecnicos.map((tecnico) => [tecnico.id, {
    id: tecnico.id, nombre: `${tecnico.nombre} ${tecnico.apellido}`.trim(), total: 0, resueltas: 0, porcentaje: 0,
  }]));

  for (const incident of incidents) {
    const fecha = fechaRegistro(incident.createdAt);
    if (Number.isFinite(fecha.getTime()) && fecha <= now) {
      const mes = mesesPorClave.get(monthKey(fecha));
      if (mes) mes.count++;
    }
    const categoria = incident.category.trim() || 'Sin categoría';
    categorias.set(categoria, (categorias.get(categoria) ?? 0) + 1);
    const estado = LEGACY_STATES[incident.status] ?? incident.status;
    conteosEstados.set(estado, (conteosEstados.get(estado) ?? 0) + 1);

    if (incident.assigneeId != null) {
      // El ID evita mezclar técnicos que comparten el mismo nombre.
      let tecnico = rendimiento.get(incident.assigneeId);
      if (!tecnico) {
        tecnico = { id: incident.assigneeId, nombre: incident.assignee || `Técnico ${incident.assigneeId}`, total: 0, resueltas: 0, porcentaje: 0 };
        rendimiento.set(tecnico.id, tecnico);
      }
      tecnico.total++;
      if (RESOLVED_STATES.has(incident.status)) tecnico.resueltas++;
    }
  }

  return {
    meses,
    categorias: [...categorias.entries()]
      .sort(([labelA, countA], [labelB, countB]) => countB - countA || labelA.localeCompare(labelB, 'es'))
      .map(([label, count]): ReportChartItem => ({ label, count, color: '#8b5cf6' })),
    distribucionEstados: [...conteosEstados.entries()]
      .map(([label, count]): ReportChartItem => ({ label, count, color: STATE_COLORS[label] ?? '#64748b' })),
    rendimiento: [...rendimiento.values()]
      .map((tecnico) => ({ ...tecnico, porcentaje: tecnico.total > 0 ? Math.round(tecnico.resueltas / tecnico.total * 100) : 0 }))
      .sort((a, b) => b.porcentaje - a.porcentaje || b.total - a.total || a.nombre.localeCompare(b.nombre, 'es')),
  };
}
