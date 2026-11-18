import assert from 'node:assert/strict';
import test from 'node:test';
import { crearCsvReporte, crearPdfReporte, crearSeccionesReporte } from '../src/utils/exportarReportes.ts';
import { calcularMetricasReportes } from '../src/utils/reportesMetrics.ts';
import { calcularGraficosReportes } from '../src/utils/reportesCharts.ts';

const fecha = new Date('2026-11-17T03:00:00Z');
const datos = (incidencias = []) => ({
  total: incidencias.length,
  metricas: calcularMetricasReportes(incidencias),
  graficos: calcularGraficosReportes(incidencias, ['Pendiente', 'Resuelta', 'Cerrada'], [], fecha),
});
const incidencia = (extra = {}) => ({
  category: 'Software', status: 'Resuelta', priority: 'Alta', assigneeId: 1,
  assignee: 'María Pérez', createdAt: '2026-11-15T08:00:00-05:00',
  closedAt: '2026-11-15T10:00:00-05:00', calificacion: 5, ...extra,
});

test('la exportación preserva los totales, promedios y técnicos usados en pantalla', () => {
  const secciones = crearSeccionesReporte(datos([incidencia(), incidencia({ status: 'Pendiente', closedAt: undefined, calificacion: undefined })]));
  assert.equal(secciones.length, 5);
  assert.deepEqual(secciones[0].filas[1], ['Tasa de resolución', '50%', '1 resueltas o cerradas']);
  assert.equal(secciones[0].filas[2][1], '2.0 h');
  assert.equal(secciones[0].filas[5][1], '5.0 / 5,0');
  assert.deepEqual(secciones[4].filas, [['María Pérez', '2', '1', '50%']]);
});

test('CSV preserva comillas, separadores, acentos y saltos; neutraliza fórmulas', () => {
  const csv = crearCsvReporte(datos([incidencia({ category: '=HYPERLINK("malicioso");\nPrueba' })]), fecha);
  assert.ok(csv.startsWith('\uFEFF'));
  assert.ok(csv.includes('"\'=HYPERLINK(""malicioso"");\nPrueba"'));
  assert.ok(csv.includes('María Pérez'));
  // 03:00 UTC del 17 todavía corresponde al día 16 en Lima.
  assert.match(csv, /16 de noviembre de 2026/);
});

test('sin incidencias exporta valores faltantes como Sin datos, nunca NaN', async () => {
  const csv = crearCsvReporte(datos(), fecha);
  assert.ok(csv.includes('Sin datos'));
  assert.ok(!csv.includes('NaN'));
  const doc = await crearPdfReporte(datos(), fecha);
  assert.ok(doc.output().startsWith('%PDF-'));
});

test('PDF pagina catálogos extensos sin perder técnicos al final', async () => {
  const reporte = datos();
  reporte.graficos.rendimiento = Array.from({ length: 160 }, (_, id) => ({
    id, nombre: `Técnico ${id} Apellido extenso para verificar ajuste de texto`,
    total: 5, resueltas: 3, porcentaje: 60,
  }));
  const doc = await crearPdfReporte(reporte, fecha);
  assert.ok(doc.getNumberOfPages() > 3);
  assert.ok(doc.lastAutoTable.body.some((row) => row.raw[0].startsWith('Técnico 159 ')));
  assert.ok(doc.lastAutoTable.finalY < 277);
});
