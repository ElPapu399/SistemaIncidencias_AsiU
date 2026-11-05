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
    target: 'sidebar-ayuda',
    title: 'Centro de ayuda',
    content: 'Consulta guías rápidas de autoayuda para Wi-Fi, contraseñas, licencias de software y equipos antes de abrir un ticket.',
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
    title: 'Gestión de usuarios',
    content: 'Administra las cuentas de estudiantes y del personal técnico de soporte desde una sola vista con pestañas.',
    position: 'right',
  },
  {
    target: 'sidebar-laboratorios',
    title: 'Gestión de laboratorios',
    content: 'Consulta y administra la infraestructura de laboratorios de cómputo y equipos del campus.',
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
    content: 'Gestiona categorías y especialidades de incidencias. Personaliza el sistema según las necesidades del campus.',
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
    target: 'sidebar-incidencias',
    title: 'Incidencias',
    content: 'Consulta tus incidencias asignadas, toma tickets disponibles y revisa el panorama completo del campus.',
    position: 'right',
  },
  RECENT_TABLE,
  HEADER_USER,
  PERFIL,
];

// ─── TECNICO_GENERAL (Mesa de ayuda / Triaje) ───
const tecnicoGeneralSteps: TourStep[] = [
  COMMON_WELCOME,
  SIDEBAR_NAV,
  STAT_CARDS,
  {
    target: 'sidebar-incidencias',
    title: 'Gestión de incidencias',
    content: 'Como soporte de mesa de ayuda, revisa los tickets entrantes, delega casos a los técnicos especialistas y atiende solicitudes de reasignación.',
    position: 'right',
  },
  {
    target: 'sidebar-carga-tecnicos',
    title: 'Carga de trabajo',
    content: 'Monitorea la cantidad de tickets activos de cada especialista para balancear las asignaciones.',
    position: 'right',
  },
  RECENT_TABLE,
  HEADER_USER,
  PERFIL,
];

// ─── TECNICO_ESPECIALISTA ───
const tecnicoEspecialistaSteps: TourStep[] = [
  COMMON_WELCOME,
  SIDEBAR_NAV,
  STAT_CARDS,
  {
    target: 'sidebar-incidencias',
    title: 'Incidencias',
    content: 'Gestiona tus incidencias asignadas en laboratorios y toma nuevos tickets disponibles para tu especialidad.',
    position: 'right',
  },
  {
    target: 'sidebar-laboratorios',
    title: 'Laboratorios',
    content: 'Consulta la información de los laboratorios y equipos del campus.',
    position: 'right',
  },
  {
    target: 'sidebar-taller',
    title: 'Taller de equipos',
    content: 'Monitorea el hardware en mantenimiento o averiado en el campus y actualiza su estado directamente.',
    position: 'right',
  },
  {
    target: 'sidebar-mi-rendimiento',
    title: 'Mi rendimiento',
    content: 'Visualiza tus métricas de productividad: porcentaje de resolución, tiempo promedio y desglose por categorías.',
    position: 'right',
  },
  {
    target: 'sidebar-calificaciones',
    title: 'Mis calificaciones',
    content: 'Revisa las evaluaciones y comentarios recibidos de los estudiantes.',
    position: 'right',
  },
  RECENT_TABLE,
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
