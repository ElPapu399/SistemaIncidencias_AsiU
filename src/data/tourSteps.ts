import type { TourStep } from '../components/dashboard/GuidedTour';

const COMMON_WELCOME: TourStep = {
  target: 'sidebar-logo',
  title: '¡Bienvenido al ASIU!',
  content: 'Este es el Sistema de Atención y Seguimiento de Incidencias Universitarias. Te guiaremos por las funciones principales según tu rol.',
  position: 'right',
};

const SIDEBAR_NAV: TourStep = {
  target: 'sidebar-nav',
  title: 'Menú de navegación',
  content: 'Desde aquí puedes acceder a todas las secciones del sistema. Las opciones visibles dependen de tu rol.',
  position: 'right',
};

const STAT_CARDS: TourStep = {
  target: 'stat-cards',
  title: 'Resumen general',
  content: 'Estas tarjetas muestran un resumen rápido del estado de las incidencias: totales, pendientes, en atención y resueltas.',
  position: 'bottom',
};

const RECENT_TABLE: TourStep = {
  target: 'recent-incidents',
  title: 'Incidencias recientes',
  content: 'Aquí verás las últimas incidencias registradas con su estado actual, prioridad y categoría.',
  position: 'top',
};

const PERFIL: TourStep = {
  target: 'sidebar-perfil',
  title: 'Tu perfil',
  content: 'Accede a tu perfil para ver y actualizar tu información personal.',
  position: 'right',
};

const HEADER_USER: TourStep = {
  target: 'header-user-info',
  title: 'Tu sesión',
  content: 'Aquí puedes ver tu nombre y rol actual. Tu sesión se cerrará automáticamente cuando expire el token.',
  position: 'bottom',
};

// ─── ESTUDIANTE ───
const estudianteSteps: TourStep[] = [
  COMMON_WELCOME,
  {
    target: 'sidebar-nueva',
    title: 'Registrar incidencia',
    content: 'Aquí puedes reportar un nuevo problema técnico. Describe el problema, selecciona la categoría, el equipo afectado y adjunta evidencia si es necesario.',
    position: 'right',
  },
  STAT_CARDS,
  {
    target: 'sidebar-incidencias',
    title: 'Mis incidencias',
    content: 'Consulta el estado de todas las incidencias que has reportado. Puedes filtrar por estado, prioridad o buscar por título.',
    position: 'right',
  },
  RECENT_TABLE,
  {
    target: 'sidebar-historial',
    title: 'Historial',
    content: 'Revisa las incidencias que ya fueron resueltas o cerradas. Puedes ver los detalles y la trazabilidad completa.',
    position: 'right',
  },
  HEADER_USER,
  PERFIL,
];

// ─── ADMIN ───
const adminSteps: TourStep[] = [
  COMMON_WELCOME,
  SIDEBAR_NAV,
  STAT_CARDS,
  {
    target: 'sidebar-incidencias',
    title: 'Gestión de incidencias',
    content: 'Visualiza todas las incidencias del campus. Puedes asignar técnicos, cambiar estados y ver el detalle completo de cada una.',
    position: 'right',
  },
  {
    target: 'sidebar-usuarios',
    title: 'Gestión de estudiantes',
    content: 'Administra las cuentas de los estudiantes: crea nuevos, edita datos o desactiva cuentas.',
    position: 'right',
  },
  {
    target: 'sidebar-tecnicos',
    title: 'Gestión de técnicos',
    content: 'Administra al equipo técnico de soporte. Asigna especialidades y consulta su carga de trabajo.',
    position: 'right',
  },
  {
    target: 'sidebar-reportes',
    title: 'Reportes y estadísticas',
    content: 'Genera reportes visuales sobre el desempeño del sistema: distribución por categoría, tiempos de resolución y métricas clave.',
    position: 'right',
  },
  {
    target: 'sidebar-calificaciones',
    title: 'Calificaciones de técnicos',
    content: 'Consulta las evaluaciones que los estudiantes han dado a los técnicos por sus atenciones.',
    position: 'right',
  },
  {
    target: 'sidebar-configuracion',
    title: 'Configuración del sistema',
    content: 'Gestiona categorías, especialidades y estados de incidencias. Personaliza el sistema según las necesidades del campus.',
    position: 'right',
  },
  {
    target: 'category-breakdown',
    title: 'Distribución por categoría',
    content: 'Gráfico que muestra cómo se distribuyen las incidencias según su categoría, ideal para identificar problemas recurrentes.',
    position: 'left',
  },
  HEADER_USER,
  PERFIL,
];

// ─── TECNICO (Soporte base) ───
const tecnicoSteps: TourStep[] = [
  COMMON_WELCOME,
  SIDEBAR_NAV,
  STAT_CARDS,
  {
    target: 'sidebar-mis-incidencias',
    title: 'Mis incidencias asignadas',
    content: 'Aquí encontrarás las incidencias que te fueron asignadas. Cambia su estado conforme avanzas en la atención.',
    position: 'right',
  },
  {
    target: 'sidebar-incidencias',
    title: 'Todas las incidencias',
    content: 'Consulta el panorama completo de incidencias en el campus, incluyendo las asignadas a otros técnicos.',
    position: 'right',
  },
  RECENT_TABLE,
  {
    target: 'sidebar-historial',
    title: 'Historial',
    content: 'Revisa las incidencias resueltas o cerradas y la trazabilidad de cada una.',
    position: 'right',
  },
  HEADER_USER,
  PERFIL,
];

// ─── TECNICO_GENERAL (Coordinador) ───
const tecnicoGeneralSteps: TourStep[] = [
  COMMON_WELCOME,
  SIDEBAR_NAV,
  STAT_CARDS,
  {
    target: 'sidebar-incidencias',
    title: 'Gestión de incidencias',
    content: 'Como técnico general, puedes gestionar incidencias: asignar técnicos especialistas, cambiar estados y dar seguimiento.',
    position: 'right',
  },
  {
    target: 'sidebar-tecnicos',
    title: 'Equipo técnico',
    content: 'Consulta y administra al equipo de técnicos de soporte bajo tu coordinación.',
    position: 'right',
  },
  {
    target: 'sidebar-calificaciones',
    title: 'Calificaciones',
    content: 'Revisa las evaluaciones de desempeño de los técnicos del equipo.',
    position: 'right',
  },
  RECENT_TABLE,
  {
    target: 'sidebar-historial',
    title: 'Historial general',
    content: 'Accede al historial completo de incidencias resueltas y cerradas del campus.',
    position: 'right',
  },
  HEADER_USER,
  PERFIL,
];

// ─── TECNICO_ESPECIALISTA ───
const tecnicoEspecialistaSteps: TourStep[] = [
  COMMON_WELCOME,
  SIDEBAR_NAV,
  STAT_CARDS,
  {
    target: 'sidebar-mis-incidencias',
    title: 'Mis incidencias asignadas',
    content: 'Atiende las incidencias especializadas que te fueron asignadas. Actualiza su estado mientras trabajas en ellas.',
    position: 'right',
  },
  {
    target: 'sidebar-incidencias',
    title: 'Todas las incidencias',
    content: 'Vista general de todas las incidencias del campus para tener contexto completo.',
    position: 'right',
  },
  {
    target: 'sidebar-laboratorios',
    title: 'Laboratorios',
    content: 'Consulta la información de los laboratorios y equipos del campus.',
    position: 'right',
  },
  RECENT_TABLE,
  {
    target: 'sidebar-historial',
    title: 'Historial',
    content: 'Revisa incidencias resueltas y cerradas con trazabilidad completa.',
    position: 'right',
  },
  HEADER_USER,
  PERFIL,
];

export function getTourSteps(role: string): TourStep[] {
  switch (role) {
    case 'ADMIN':
      return adminSteps;
    case 'ESTUDIANTE':
      return estudianteSteps;
    case 'TECNICO':
      return tecnicoSteps;
    case 'TECNICO_GENERAL':
      return tecnicoGeneralSteps;
    case 'TECNICO_ESPECIALISTA':
      return tecnicoEspecialistaSteps;
    default:
      return estudianteSteps;
  }
}

export function getTourStorageKey(role: string): string {
  return `tour_dismissed_${role}`;
}
