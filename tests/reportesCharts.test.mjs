import assert from 'node:assert/strict';
import test from 'node:test';
import { calcularGraficosReportes } from '../src/utils/reportesCharts.ts';

const estados = ['Pendiente', 'Asignada', 'En atención', 'Resuelta', 'Cerrada'];
const now = new Date('2026-10-22T12:00:00-05:00');
const incidencia = (datos = {}) => ({
  id: 'INC-1', title: 'Prueba', description: '', category: 'Error de aplicación', especialidad: 'Software',
  priority: 'Media', status: 'Pendiente', reporter: 'Estudiante', assignee: 'Sin asignar',
  location: 'Laboratorio A', createdAt: '2026-10-15T08:00:00-05:00', ...datos,
});
const tecnico = (id, nombre, apellido = 'Pérez') => ({ id, nombre, apellido, correo: '', especialidad: 'Software', incidenciasActivas: 0 });

test('incluye seis meses consecutivos, meses vacíos y el cambio de año', () => {
  const { meses } = calcularGraficosReportes([], estados, [], new Date('2027-01-03T12:00:00-05:00'));
  assert.deepEqual(meses.map((mes) => mes.key), ['2026-08', '2026-09', '2026-10', '2026-11', '2026-12', '2027-01']);
  assert.ok(meses.every((mes) => mes.count === 0));
});

test('agrupa fechas en Lima y excluye fechas inválidas, anteriores al período y futuras', () => {
  const datos = [
    incidencia({ createdAt: '2026-06-01T01:00:00Z' }), // Mayo en Lima.
    incidencia({ createdAt: '2026-06-01T00:00:00' }), // LocalDateTime del backend: junio en Lima.
    incidencia(),
    incidencia({ createdAt: '2026-04-30T23:59:59-05:00' }),
    incidencia({ createdAt: '2026-10-23T12:00:00-05:00' }),
    incidencia({ createdAt: 'fecha inválida' }),
  ];
  const { meses } = calcularGraficosReportes(datos, estados, [], now);
  assert.deepEqual(meses.map((mes) => mes.count), [1, 1, 0, 0, 0, 1]);
});

test('clasifica por categoría real y no por especialidad, sin perder incidencias sin categoría', () => {
  const { categorias } = calcularGraficosReportes([
    incidencia(), incidencia(), incidencia({ category: 'Sin conexión a Internet', especialidad: 'Redes' }), incidencia({ category: '  ' }),
  ], estados, [], now);
  assert.equal(categorias.find((item) => item.label === 'Error de aplicación').count, 2);
  assert.equal(categorias.find((item) => item.label === 'Sin categoría').count, 1);
  assert.ok(!categorias.some((item) => item.label === 'Software'));
  assert.equal(categorias.reduce((sum, item) => sum + item.count, 0), 4);
});

test('los estados heredados se agrupan sin perder estados adicionales ni los estados en cero', () => {
  const datos = ['En atención', 'En Proceso', 'Resuelta', 'Resuelto', 'Cerrada', 'Cancelado'].map((status) => incidencia({ status }));
  const { distribucionEstados } = calcularGraficosReportes(datos, estados, [], now);
  assert.equal(distribucionEstados.find((item) => item.label === 'Pendiente').count, 0);
  assert.equal(distribucionEstados.find((item) => item.label === 'En atención').count, 2);
  assert.equal(distribucionEstados.find((item) => item.label === 'Resuelta').count, 2);
  assert.equal(distribucionEstados.find((item) => item.label === 'Cancelado').count, 1);
  assert.equal(distribucionEstados.reduce((sum, item) => sum + item.count, 0), datos.length);
});

test('rendimiento distingue IDs con nombres iguales y cuenta solo los tickets del técnico actual', () => {
  const { rendimiento } = calcularGraficosReportes([
    incidencia({ assigneeId: 1, assignee: 'Ana Pérez', status: 'Resuelta', tecnicoAnteriorId: 2, fueReasignada: true }),
    incidencia({ assigneeId: 1, assignee: 'Ana Pérez', status: 'Cerrada' }),
    incidencia({ assigneeId: 1, assignee: 'Ana Pérez' }),
    incidencia({ assigneeId: 2, assignee: 'Ana Pérez', status: 'Cancelado' }),
    incidencia(),
  ], estados, [tecnico(1, 'Ana'), tecnico(2, 'Ana'), tecnico(3, 'Luis')], now);
  assert.deepEqual(rendimiento.find((item) => item.id === 1), { id: 1, nombre: 'Ana Pérez', total: 3, resueltas: 2, porcentaje: 67 });
  assert.equal(rendimiento.find((item) => item.id === 2).resueltas, 0);
  assert.equal(rendimiento.find((item) => item.id === 3).total, 0);
});

test('conserva los técnicos referenciados en incidencias aunque ya no estén en el catálogo', () => {
  const { rendimiento } = calcularGraficosReportes([incidencia({ assigneeId: 10, assignee: 'Técnico anterior', status: 'Resuelto' })], estados, [], now);
  assert.deepEqual(rendimiento, [{ id: 10, nombre: 'Técnico anterior', total: 1, resueltas: 1, porcentaje: 100 }]);
});
