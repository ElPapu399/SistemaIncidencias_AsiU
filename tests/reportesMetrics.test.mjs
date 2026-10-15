import assert from 'node:assert/strict';
import test from 'node:test';
import { calcularMetricasReportes } from '../src/utils/reportesMetrics.ts';

const incidencia = (datos = {}) => ({
  id: 'INC-1', title: 'Prueba', description: '', category: 'Error de aplicación',
  priority: 'Media', status: 'Pendiente', reporter: 'Estudiante',
  assignee: 'Sin asignar', location: 'Laboratorio A', createdAt: '2026-10-15T08:00:00-05:00',
  ...datos,
});

test('sin incidencias muestra contadores en cero y no inventa promedios', () => {
  const resultado = calcularMetricasReportes([]);
  assert.equal(resultado.tasaResolucion, 0);
  assert.equal(resultado.altaPrioridad, 0);
  assert.equal(resultado.sinAsignar, 0);
  assert.equal(resultado.tiempoPromedioHoras, null);
  assert.equal(resultado.satisfaccion, null);
});

test('resueltas y cerradas cuentan para resolución; solo las activas cuentan como pendientes de atención', () => {
  const resultado = calcularMetricasReportes([
    incidencia({ status: 'Resuelta', priority: 'Alta' }),
    incidencia({ status: 'Cerrada', priority: 'Alta' }),
    incidencia({ status: 'Resuelto' }),
    incidencia({ status: 'Asignada', priority: 'Alta', assigneeId: 7 }),
    incidencia({ status: 'Pendiente', priority: 'Alta' }),
    incidencia({ status: 'Cancelado', priority: 'Alta' }),
  ]);
  assert.equal(resultado.tasaResolucion, 50);
  assert.equal(resultado.resueltas, 3);
  assert.equal(resultado.altaPrioridad, 2);
  assert.equal(resultado.sinAsignar, 1);
});

test('el tiempo promedio ignora fechas ausentes, inválidas, invertidas e incidencias activas', () => {
  const resultado = calcularMetricasReportes([
    incidencia({ status: 'Resuelta', closedAt: '2026-10-15T10:00:00-05:00' }),
    incidencia({ status: 'Cerrada', closedAt: '2026-10-15T12:00:00-05:00' }),
    incidencia({ status: 'Resuelta' }),
    incidencia({ status: 'Resuelta', closedAt: 'fecha inválida' }),
    incidencia({ status: 'Resuelta', closedAt: '2026-10-15T07:00:00-05:00' }),
    incidencia({ status: 'Pendiente', closedAt: '2026-10-15T20:00:00-05:00' }),
  ]);
  assert.equal(resultado.tiempoPromedioHoras, 3);
  assert.equal(resultado.incidenciasConTiempo, 2);
});

test('satisfacción solo promedia evaluaciones válidas de uno a cinco', () => {
  const resultado = calcularMetricasReportes([5, 4, null, 0, 6, NaN, 4.5].map((calificacion) => incidencia({ calificacion })));
  assert.equal(resultado.satisfaccion, 4.5);
  assert.equal(resultado.evaluaciones, 2);
});
