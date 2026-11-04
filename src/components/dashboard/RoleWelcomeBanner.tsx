import { Link } from 'react-router-dom';
import {
  PlusCircle,
  ClipboardList,
  FileText,
  UserCheck,
  Bell,
  Star,
  Lightbulb,
  Clock,
  ArrowRight,
  BarChart3,
  Settings,
  Users,
  Sliders,
  ShieldCheck,
  ArrowRightLeft,
  CheckCircle2,
  Wrench,
  Laptop,
  Headphones,
  type LucideIcon,
} from 'lucide-react';
import type { UserRole } from '../../types/user';

interface StepItem {
  num: string;
  title: string;
  desc: string;
  icon: LucideIcon;
  accent: string;
}

interface RoleConfig {
  badge: string;
  badgeIcon?: LucideIcon;
  badgeStyle: string;
  greetingTitle: (name?: string) => string;
  description: string;
  primaryAction: {
    to: string;
    label: string;
    icon: LucideIcon;
  };
  secondaryAction: {
    to: string;
    label: string;
    icon: LucideIcon;
  };
  flowTitle: string;
  steps: StepItem[];
  tipTitle: string;
  tipText: string;
  scheduleText: string;
  scheduleIcon: LucideIcon;
}

const ROLE_CONFIGS: Record<string, RoleConfig> = {
  ADMIN: {
    badge: 'Panel de Administración · ASIU',
    badgeIcon: ShieldCheck,
    badgeStyle: 'bg-indigo-50 text-indigo-700 border-indigo-200',
    greetingTitle: (name) => `¡Hola, ${name || 'Administrador'}! 🛡️`,
    description:
      'Supervisa la resolución de incidencias en el campus, gestiona usuarios y catálogos, y analiza métricas de cumplimiento de SLA y satisfacción del servicio.',
    primaryAction: {
      to: '/dashboard/reportes',
      label: 'Ver reportes y métricas',
      icon: BarChart3,
    },
    secondaryAction: {
      to: '/dashboard/configuracion',
      label: 'Configurar catálogos',
      icon: Settings,
    },
    flowTitle: '¿Cuáles son tus responsabilidades como administrador?',
    steps: [
      {
        num: '1',
        title: 'Gestión de Usuarios',
        desc: 'Administra cuentas y roles de estudiantes, técnicos generales y especialistas de campo.',
        icon: Users,
        accent: 'bg-blue-100 text-blue-700 border-blue-200',
      },
      {
        num: '2',
        title: 'Catálogos y SLA',
        desc: 'Configura categorías, edificios, laboratorios y tiempos máximos de respuesta de atención.',
        icon: Sliders,
        accent: 'bg-violet-100 text-violet-700 border-violet-200',
      },
      {
        num: '3',
        title: 'Supervisión de Soporte',
        desc: 'Monitorea la carga de trabajo, solicitudes de reasignación y flujo de tickets universitarios.',
        icon: ArrowRightLeft,
        accent: 'bg-amber-100 text-amber-700 border-amber-200',
      },
      {
        num: '4',
        title: 'Auditoría y Métricas',
        desc: 'Evalúa calificaciones de estudiantes, reportes de satisfacción e historial de trazabilidad.',
        icon: ShieldCheck,
        accent: 'bg-emerald-100 text-emerald-700 border-emerald-200',
      },
    ],
    tipTitle: 'Supervisión continua:',
    tipText:
      'Revisa periódicamente la sección de Calificaciones para identificar oportunidades de mejora y destacar el desempeño de los técnicos.',
    scheduleText: 'Auditoría y control global activo',
    scheduleIcon: ShieldCheck,
  },

  TECNICO_GENERAL: {
    badge: 'Mesa de Ayuda · Gestión y Triaje',
    badgeIcon: Headphones,
    badgeStyle: 'bg-sky-50 text-sky-700 border-sky-200',
    greetingTitle: (name) => `¡Hola, ${name || 'Técnico'}! 🎧`,
    description:
      'Gestiona la bandeja de entrada de tickets, clasifica la criticidad de cada falla y deriva las incidencias a los técnicos especialistas idóneos.',
    primaryAction: {
      to: '/dashboard/incidencias',
      label: 'Revisar incidencias',
      icon: ClipboardList,
    },
    secondaryAction: {
      to: '/dashboard/calificaciones-tecnicos',
      label: 'Mis calificaciones',
      icon: Star,
    },
    flowTitle: '¿Cómo funciona el flujo de trabajo en Mesa de Ayuda?',
    steps: [
      {
        num: '1',
        title: 'Recepción y Triaje',
        desc: 'Revisa las incidencias entrantes reportadas por estudiantes y valida la criticidad de la falla.',
        icon: FileText,
        accent: 'bg-blue-100 text-blue-700 border-blue-200',
      },
      {
        num: '2',
        title: 'Asignación Técnica',
        desc: 'Deriva cada ticket al técnico especialista idóneo según la categoría y ubicación del problema.',
        icon: UserCheck,
        accent: 'bg-violet-100 text-violet-700 border-violet-200',
      },
      {
        num: '3',
        title: 'Gestión de Reasignaciones',
        desc: 'Evalúa y responde solicitudes de reasignación enviadas por los técnicos en laboratorios.',
        icon: ArrowRightLeft,
        accent: 'bg-amber-100 text-amber-700 border-amber-200',
      },
      {
        num: '4',
        title: 'Atención de 1er Nivel',
        desc: 'Resuelve directamente incidencias de configuración o asesoría técnica sin requerir desplazamiento.',
        icon: CheckCircle2,
        accent: 'bg-emerald-100 text-emerald-700 border-emerald-200',
      },
    ],
    tipTitle: 'Regla operativa:',
    tipText:
      'Prioriza incidencias de prioridad Alta (resolución en menos de 4h) para asegurar el cumplimiento del Acuerdo de Nivel de Servicio (SLA).',
    scheduleText: 'Mesa de ayuda y triaje activa',
    scheduleIcon: Headphones,
  },

  TECNICO_ESPECIALISTA: {
    badge: 'Soporte Especializado · Nivel 2',
    badgeIcon: Wrench,
    badgeStyle: 'bg-amber-50 text-amber-700 border-amber-200',
    greetingTitle: (name) => `¡Hola, ${name || 'Especialista'}! 🛠️`,
    description:
      'Atiende incidencias de tu área técnica, diagnostica en laboratorios y registra la solución aplicada para restablecer la operatividad de los equipos.',
    primaryAction: {
      to: '/dashboard/incidencias',
      label: 'Mis tickets asignados',
      icon: Wrench,
    },
    secondaryAction: {
      to: '/dashboard/calificaciones-tecnicos',
      label: 'Mis calificaciones',
      icon: Star,
    },
    flowTitle: '¿Cómo resolver incidencias especializadas?',
    steps: [
      {
        num: '1',
        title: 'Diagnóstico en Sitio',
        desc: 'Acude al laboratorio o aula correspondiente e inspecciona el equipo o sistema afectado.',
        icon: Laptop,
        accent: 'bg-blue-100 text-blue-700 border-blue-200',
      },
      {
        num: '2',
        title: 'Solicitud de Reasignación',
        desc: 'Si la avería corresponde a otra especialidad, solicita la derivación detallando el motivo.',
        icon: ArrowRightLeft,
        accent: 'bg-violet-100 text-violet-700 border-violet-200',
      },
      {
        num: '3',
        title: 'Solución Técnica',
        desc: 'Aplica el mantenimiento, repara la falla y registra el reporte de solución para cerrar el caso.',
        icon: CheckCircle2,
        accent: 'bg-emerald-100 text-emerald-700 border-emerald-200',
      },
      {
        num: '4',
        title: 'Evaluación y Calidad',
        desc: 'Revisa las estrellas y comentarios de los estudiantes para mantener la excelencia técnica.',
        icon: Star,
        accent: 'bg-amber-100 text-amber-700 border-amber-200',
      },
    ],
    tipTitle: 'Buenas prácticas:',
    tipText:
      'Redactar una descripción clara de la solución aplicada facilita la validación del estudiante y nutre la base de conocimiento universitaria.',
    scheduleText: 'Atención técnica en laboratorios',
    scheduleIcon: Clock,
  },

  ESTUDIANTE: {
    badge: 'Portal del Estudiante · Soporte Campus',
    badgeStyle: 'bg-blue-50 text-blue-700 border-blue-200',
    greetingTitle: (name) => `¡Hola, ${name || 'Estudiante'}! 👋`,
    description:
      '¿Detectaste alguna avería en computadoras de laboratorio, proyectores, conectividad Wi-Fi o infraestructura de la universidad? Repórtala aquí y nuestro equipo técnico se encargará de solucionarla con trazabilidad en tiempo real.',
    primaryAction: {
      to: '/dashboard/nueva',
      label: 'Reportar incidencia',
      icon: PlusCircle,
    },
    secondaryAction: {
      to: '/dashboard/incidencias',
      label: 'Ver mis tickets',
      icon: ClipboardList,
    },
    flowTitle: '¿Cómo funciona el proceso de atención?',
    steps: [
      {
        num: '1',
        title: 'Registra el ticket',
        desc: 'Describe la falla, indica el laboratorio o aula y adjunta fotos de evidencia.',
        icon: FileText,
        accent: 'bg-blue-100 text-blue-700 border-blue-200',
      },
      {
        num: '2',
        title: 'Asignación técnica',
        desc: 'Mesa de ayuda evalúa la prioridad y asigna al técnico especialista correspondiente.',
        icon: UserCheck,
        accent: 'bg-violet-100 text-violet-700 border-violet-200',
      },
      {
        num: '3',
        title: 'Seguimiento activo',
        desc: 'Monitorea el avance y recibe notificaciones cuando tu ticket sea atendido.',
        icon: Bell,
        accent: 'bg-amber-100 text-amber-700 border-amber-200',
      },
      {
        num: '4',
        title: 'Solución y calificación',
        desc: 'Revisa la solución aplicada y evalúa el servicio del técnico para seguir mejorando.',
        icon: Star,
        accent: 'bg-emerald-100 text-emerald-700 border-emerald-200',
      },
    ],
    tipTitle: 'Consejo útil:',
    tipText:
      'Detallar el pabellón, aula y número de máquina (ej. Lab 204, PC-15) permite que el técnico atienda el problema de inmediato.',
    scheduleText: 'Soporte presencial: Lun - Vie 7:00 a 22:00',
    scheduleIcon: Clock,
  },
};

export interface RoleWelcomeBannerProps {
  nombre?: string;
  rol?: UserRole | string;
}

export default function RoleWelcomeBanner({ nombre, rol }: RoleWelcomeBannerProps) {
  // Map legacy 'TECNICO' to 'TECNICO_ESPECIALISTA' or 'TECNICO_GENERAL'
  const normalizedRole = rol === 'TECNICO' ? 'TECNICO_GENERAL' : (rol || 'ESTUDIANTE');
  const config = ROLE_CONFIGS[normalizedRole] || ROLE_CONFIGS.ESTUDIANTE;

  const PrimaryIcon = config.primaryAction.icon;
  const SecondaryIcon = config.secondaryAction.icon;
  const ScheduleIcon = config.scheduleIcon;
  const BadgeIcon = config.badgeIcon;

  return (
    <div className="bg-white border border-slate-300 rounded-3xl p-6 sm:p-8 shadow-sm space-y-6">
      {/* Hero Welcome Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-5">
        <div className="space-y-2 max-w-2xl text-left">
          <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold border ${config.badgeStyle}`}>
            {BadgeIcon && <BadgeIcon className="w-3.5 h-3.5" />}
            <span>{config.badge}</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
            {config.greetingTitle(nombre)}
          </h2>
          <p className="text-sm text-slate-600 leading-relaxed">
            {config.description}
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex w-full min-w-0 items-center gap-3
          overflow-x-auto overscroll-x-contain snap-x snap-mandatory pb-2
          lg:w-auto lg:shrink-0 lg:overflow-visible
          lg:snap-none lg:pb-0">
          <Link
            to={config.primaryAction.to}
            className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-sm shadow-sm transition-all hover:shadow-md cursor-pointer w-[85%] shrink-0 snap-start lg:w-auto"
          >
            <PrimaryIcon className="w-4 h-4 shrink-0" />
            <span>{config.primaryAction.label}</span>
          </Link>
          <Link
            to={config.secondaryAction.to}
            className="inline-flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-sm border border-slate-300 transition-colors cursor-pointer shrink-0 whitespace-nowrap w-[85%] snap-start lg:w-auto"
          >
            <SecondaryIcon className="w-4 h-4 shrink-0 text-slate-500" />
            <span>{config.secondaryAction.label}</span>
          </Link>
        </div>
      </div>

      {/* Process / Responsibility Flow (4 steps) */}
      <div className="pt-2 border-t border-slate-100">
        <div className="flex items-center justify-between mb-3 text-left">
          <p className="text-xs uppercase font-bold tracking-wider text-slate-500">
            {config.flowTitle}
          </p>
          <span className="hidden sm:inline-flex items-center gap-1 text-xs text-slate-400">
            Flujo paso a paso <ArrowRight className="w-3.5 h-3.5" />
          </span>
        </div>

        <div
          role="region"
          tabIndex={0}
          className="
            flex w-full min-w-0 gap-3
            overflow-x-auto overscroll-x-contain
            snap-x snap-mandatory pb-2
            sm:grid sm:grid-cols-2 sm:overflow-visible
            sm:snap-none sm:pb-0 lg:grid-cols-4
          "
        >
          {config.steps.map((step) => {
            const Icon = step.icon;
            return (
              <div
                key={step.num}
                className="w-[65%] min-w-0 shrink-0 snap-start sm:w-auto bg-slate-50/70 border border-slate-200 rounded-2xl p-4 flex flex-col justify-between hover:bg-slate-50 hover:border-slate-300 transition-colors text-left"
              >
                <div>
                  <div className="flex items-center justify-between mb-2.5">
                    <span className={`w-8 h-8 rounded-lg border flex items-center justify-center text-xs font-bold ${step.accent}`}>
                      {step.num}
                    </span>
                    <Icon className="w-4 h-4 text-slate-400" />
                  </div>
                  <h4 className="text-xs font-bold text-slate-900 mb-1">{step.title}</h4>
                  <p className="text-[11px] text-slate-500 leading-relaxed">{step.desc}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Helpful Tip & Schedule Strip */}
      <div className="bg-amber-50/60 border border-amber-200/80 rounded-2xl p-3.5 sm:px-4 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 text-xs text-left">
        <div className="flex items-start sm:items-center gap-2.5 text-amber-900">
          <div className="w-6 h-6 rounded-md bg-amber-100 flex items-center justify-center shrink-0 mt-0.5 sm:mt-0">
            <Lightbulb className="w-3.5 h-3.5 text-amber-700" />
          </div>
          <span>
            <strong className="font-semibold text-amber-950">{config.tipTitle}</strong> {config.tipText}
          </span>
        </div>

        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/80 border border-amber-300 text-amber-800 font-medium shrink-0 self-start sm:self-auto text-[11px]">
          <ScheduleIcon className="w-3 h-3 text-amber-600" />
          <span>{config.scheduleText}</span>
        </div>
      </div>
    </div>
  );
}

// Backward-compatible alias
export { RoleWelcomeBanner as StudentWelcomeBanner };

