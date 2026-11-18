import type { calcularGraficosReportes } from './reportesCharts';
import type { calcularMetricasReportes } from './reportesMetrics';

export interface DatosReporte {
  total: number;
  metricas: ReturnType<typeof calcularMetricasReportes>;
  graficos: ReturnType<typeof calcularGraficosReportes>;
}

interface SeccionReporte {
  titulo: string;
  columnas: string[];
  filas: string[][];
}

export function crearSeccionesReporte({ total, metricas, graficos }: DatosReporte): SeccionReporte[] {
  const decimal = new Intl.NumberFormat('es-PE', { minimumFractionDigits: 1, maximumFractionDigits: 1 });
  return [
    {
      titulo: 'Resumen general',
      columnas: ['Indicador', 'Valor', 'Detalle'],
      filas: [
        ['Incidencias registradas', String(total), 'Total de incidencias disponibles'],
        ['Tasa de resolución', `${metricas.tasaResolucion}%`, `${metricas.resueltas} resueltas o cerradas`],
        ['Tiempo promedio', metricas.tiempoPromedioHoras === null ? 'Sin datos' : `${decimal.format(metricas.tiempoPromedioHoras)} h`, 'Desde el registro hasta la resolución o cierre'],
        ['Alta prioridad', String(metricas.altaPrioridad), 'Incidencias activas de prioridad alta'],
        ['Sin asignar', String(metricas.sinAsignar), 'Incidencias activas sin técnico asignado'],
        ['Satisfacción (CSAT)', metricas.satisfaccion === null ? 'Sin datos' : `${decimal.format(metricas.satisfaccion)} / 5,0`, `${metricas.evaluaciones} evaluaciones de estudiantes`],
      ],
    },
    {
      titulo: 'Incidencias por mes (últimos 6 meses)',
      columnas: ['Mes', 'Incidencias'],
      filas: graficos.meses.map((mes) => [mes.fullLabel, String(mes.count)]),
    },
    {
      titulo: 'Por categoría',
      columnas: ['Categoría', 'Incidencias'],
      filas: graficos.categorias.map((item) => [item.label, String(item.count)]),
    },
    {
      titulo: 'Distribución por estado',
      columnas: ['Estado', 'Incidencias', 'Porcentaje'],
      filas: graficos.distribucionEstados.map((item) => [
        item.label, String(item.count), `${total > 0 ? decimal.format(item.count / total * 100) : '0,0'}%`,
      ]),
    },
    {
      titulo: 'Rendimiento por técnico',
      columnas: ['Técnico', 'Asignadas', 'Resueltas o cerradas', 'Resolución'],
      filas: graficos.rendimiento.map((item) => [item.nombre, String(item.total), String(item.resueltas), `${item.porcentaje}%`]),
    },
  ];
}

// Las comillas preservan comas, saltos de línea y nombres con caracteres especiales.
// El prefijo evita interpretar texto de usuarios como fórmulas en hojas de cálculo.
function celdaCsv(value: string) {
  const texto = /^[\s]*[=+\-@\t\r]/.test(value) ? `'${value}` : value;
  return `"${texto.replaceAll('"', '""')}"`;
}

export function crearCsvReporte(datos: DatosReporte, generado = new Date()): string {
  const filas = [
    ['ASIU - Reportes y estadísticas'],
    ['Generado', fechaReporte(generado)],
    ['Alcance', 'Datos disponibles al momento de exportar; únicamente la sección mensual se limita a los últimos 6 meses.'],
    ...crearSeccionesReporte(datos).flatMap((seccion) => [
      [], [seccion.titulo], seccion.columnas,
      ...(seccion.filas.length ? seccion.filas : [['Sin datos registrados']]),
    ]),
  ];
  return '\uFEFF' + filas.map((fila) => fila.map(celdaCsv).join(';')).join('\r\n');
}

function fechaReporte(fecha: Date) {
  return new Intl.DateTimeFormat('es-PE', {
    timeZone: 'America/Lima', dateStyle: 'long', timeStyle: 'short',
  }).format(fecha);
}

function nombreReporte(fecha: Date) {
  const dia = new Intl.DateTimeFormat('en-CA', {
    timeZone: 'America/Lima', year: 'numeric', month: '2-digit', day: '2-digit',
  }).format(fecha);
  return `ASIU-reportes-${dia}`;
}

export async function crearPdfReporte(datos: DatosReporte, generado = new Date()) {
  // Se cargan al exportar para no aumentar el JavaScript inicial del dashboard.
  const [{ jsPDF }, { autoTable }] = await Promise.all([import('jspdf'), import('jspdf-autotable')]);
  const doc = new jsPDF({ format: 'a4', unit: 'mm', compress: true });
  doc.setProperties({ title: 'ASIU - Reportes y estadísticas', subject: 'Estadísticas del sistema de incidencias', creator: 'ASIU' });
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(19);
  doc.setTextColor('#0f172a');
  doc.text('ASIU | Reportes y estadísticas', 14, 21);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(10);
  doc.setTextColor('#475569');
  doc.text(`Generado: ${fechaReporte(generado)} (Lima)`, 14, 29);
  doc.text('Datos disponibles al exportar. Solo el resumen mensual abarca los últimos 6 meses.', 14, 36);

  let y = 48;
  for (const seccion of crearSeccionesReporte(datos)) {
    if (y > doc.internal.pageSize.getHeight() - 50) {
      doc.addPage();
      y = 20;
    }
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(12);
    doc.setTextColor('#0f172a');
    doc.text(seccion.titulo, 14, y);
    let finalY = y;
    autoTable(doc, {
      startY: y + 4,
      head: [seccion.columnas],
      body: seccion.filas.length ? seccion.filas : [['Sin datos registrados', ...seccion.columnas.slice(1).map(() => '')]],
      theme: 'striped',
      margin: { top: 18, bottom: 20, left: 14, right: 14 },
      styles: { font: 'helvetica', fontSize: 9, cellPadding: 3, overflow: 'linebreak', textColor: '#334155' },
      headStyles: { fillColor: '#2563eb', textColor: '#ffffff' },
      alternateRowStyles: { fillColor: '#f1f5f9' },
      rowPageBreak: 'avoid',
      didDrawPage: (hook) => { finalY = hook.cursor?.y ?? finalY; },
    });
    y = finalY + 13;
  }

  const paginas = doc.getNumberOfPages();
  for (let pagina = 1; pagina <= paginas; pagina++) {
    doc.setPage(pagina);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    doc.setTextColor('#64748b');
    doc.text(`ASIU - Página ${pagina} de ${paginas}`, 14, doc.internal.pageSize.getHeight() - 10);
  }
  return doc;
}

export async function descargarReporte(datos: DatosReporte, formato: 'pdf' | 'csv') {
  const generado = new Date();
  const nombre = nombreReporte(generado);
  if (formato === 'pdf') {
    const doc = await crearPdfReporte(datos, generado);
    doc.save(`${nombre}.pdf`);
    return;
  }
  const url = URL.createObjectURL(new Blob([crearCsvReporte(datos, generado)], { type: 'text/csv;charset=utf-8;' }));
  const enlace = document.createElement('a');
  enlace.href = url;
  enlace.download = `${nombre}.csv`;
  document.body.appendChild(enlace);
  enlace.click();
  enlace.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
