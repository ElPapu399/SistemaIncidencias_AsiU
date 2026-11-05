import { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  PlusCircle,
  ClipboardList,
  FileText,
  UserCheck,
  Bell,
  Star,
  ChevronDown,
  ChevronUp,
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
  Info,
  type LucideIcon,
} from 'lucide-react';
import type { UserRole } from '../../types/user';

interface StepItem {
  num: string;
  title: string;
  desc: string;
  icon: LucideIcon;
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
  noteText: string;
}

const ROLE_CONFIGS: Record<string, RoleConfig> = {
  ADMIN: {
    badge: 'Administración ASIU',
    badgeIcon: ShieldCheck,
    badgeStyle: 'bg-slate-100 text-slate-700 border-slate-200',
    greetingTitle: (name) => `Hola, ${name || 'bienvenido'}`,
    description:
      'Gestiona usuarios, revisa las incidencias activas en el campus y supervisa los reportes de atención del equipo técnico.',
    primaryAction: {
      to: '/dashboard/reportes',
      label: 'Ver reportes',
      icon: BarChart3,
    },
    secondaryAction: {
      to: '/dashboard/configuracion',
      label: 'Configuración',
      icon: Settings,
    },
    flowTitle: 'Funciones del administrador',
    steps: [
      {
        num: '01',
        title: 'Usuarios',
        desc: 'Crea y edita cuentas de estudiantes, técnicos y personal de soporte.',
        icon: Users,
      },
      {
        num: '02',
        title: 'Catálogos',
        desc: 'Configura pabellones, laboratorios, tipos de falla y prioridades.',
        icon: Sliders,
      },
      {
        num: '03',
        title: 'Monitoreo',
        desc: 'Revisa el estado de los tickets y aprueba solicitudes de reasignación.',
        icon: ArrowRightLeft,
      },
      {
        num: '04',
        title: 'Métricas',
        desc: 'Consulta tiempos de atención, tasas de resolución y satisfacción.',
        icon: BarChart3,
      },
    ],
    noteText: 'Supervisión general del sistema de incidencias universitarias.',
  },

  TECNICO_GENERAL: {
    badge: 'Mesa de Ayuda',
    badgeIcon: Headphones,
    badgeStyle: 'bg-sky-50 text-sky-700 border-sky-200',
    greetingTitle: (name) => `Hola, ${name || 'bienvenido'}`,
    description:
      'Revisa los reportes nuevos de los estudiantes, valida los datos de cada falla y asigna el técnico especialista correspondiente.',
    primaryAction: {
      to: '/dashboard/incidencias',
      label: 'Bandeja de incidencias',
      icon: ClipboardList,
    },
    secondaryAction: {
      to: '/dashboard/carga-tecnicos',
      label: 'Carga de trabajo',
      icon: Users,
    },
    flowTitle: 'Flujo de trabajo en mesa de ayuda',
    steps: [
      {
        num: '01',
        title: 'Recepción',
        desc: 'Revisa las incidencias registradas y confirma el aula o laboratorio.',
        icon: FileText,
      },
      {
        num: '02',
        title: 'Disponibilidad',
        desc: 'Consulta la carga de trabajo de los especialistas antes de asignar.',
        icon: Users,
      },
      {
        num: '03',
        title: 'Asignación',
        desc: 'Deriva el ticket al técnico idóneo evitando sobrecargas.',
        icon: UserCheck,
      },
      {
        num: '04',
        title: 'Reasignaciones',
        desc: 'Evalúa solicitudes de cambio de técnico enviadas desde laboratorios.',
        icon: ArrowRightLeft,
      },
    ],
    noteText: 'Atiende primero los tickets de alta prioridad para evitar demoras.',
  },

  TECNICO_ESPECIALISTA: {
    badge: 'Soporte Técnico',
    badgeIcon: Wrench,
    badgeStyle: 'bg-amber-50 text-amber-700 border-amber-200',
    greetingTitle: (name) => `Hola, ${name || 'bienvenido'}`,
    description:
      'Atiende las incidencias asignadas a tu área en laboratorios y aulas, realiza el diagnóstico presencial y registra la solución aplicada.',
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
    flowTitle: 'Flujo de trabajo en laboratorios',
    steps: [
      {
        num: '01',
        title: 'Revisión',
        desc: 'Revisa en tu bandeja los casos asignados a tu especialidad.',
        icon: ClipboardList,
      },
      {
        num: '02',
        title: 'Atención en sitio',
        desc: 'Acude al aula o laboratorio para inspeccionar y solucionar el equipo.',
        icon: Laptop,
      },
      {
        num: '03',
        title: 'Derivación',
        desc: 'Si la falla pertenece a otra área, solicita transferir el ticket.',
        icon: ArrowRightLeft,
      },
      {
        num: '04',
        title: 'Cierre',
        desc: 'Registra la solución aplicada para que el estudiante pueda verificarla.',
        icon: CheckCircle2,
      },
    ],
    noteText: 'Detallar la solución ayuda a que el estudiante confirme y califique la atención.',
  },

  ESTUDIANTE: {
    badge: 'Portal del Estudiante',
    badgeStyle: 'bg-blue-50 text-blue-700 border-blue-200',
    greetingTitle: (name) => `Hola, ${name || 'bienvenido'}`,
    description:
      'Reporta fallas con computadoras, proyectores, internet o infraestructura en tus aulas y sigue el avance de tu atención.',
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
    flowTitle: '¿Cómo funciona la atención?',
    steps: [
      {
        num: '01',
        title: 'Envía tu reporte',
        desc: 'Indica el aula o laboratorio, describe qué falla y adjunta fotos si tienes.',
        icon: FileText,
      },
      {
        num: '02',
        title: 'Asignación',
        desc: 'Mesa de ayuda clasifica tu caso y le asigna un técnico especialista.',
        icon: UserCheck,
      },
      {
        num: '03',
        title: 'Atención técnica',
        desc: 'El técnico acude a revisar y solucionar la falla reportada.',
        icon: Bell,
      },
      {
        num: '04',
        title: 'Conformidad',
        desc: 'Revisa la solución registrada y deja tu calificación del servicio.',
        icon: Star,
      },
    ],
    noteText: 'Horario de soporte presencial en campus: lunes a viernes de 7:00 a 22:00.',
  },
};

export interface RoleWelcomeBannerProps {
  nombre?: string;
  rol?: UserRole | string;
}

export default function RoleWelcomeBanner({ nombre, rol }: RoleWelcomeBannerProps) {
  const [showGuide, setShowGuide] = useState(() => {
    try {
      const saved = localStorage.getItem('asiu_banner_guide_open');
      return saved !== null ? saved === 'true' : true;
    } catch {
      return true;
    }
  });

  const toggleGuide = () => {
    setShowGuide((prev) => {
      const next = !prev;
      try {
        localStorage.setItem('asiu_banner_guide_open', String(next));
      } catch {
        // ignore storage errors
      }
      return next;
    });
  };

  const normalizedRole = rol === 'TECNICO' ? 'TECNICO_GENERAL' : (rol || 'ESTUDIANTE');
  const config = ROLE_CONFIGS[normalizedRole] || ROLE_CONFIGS.ESTUDIANTE;

  const PrimaryIcon = config.primaryAction.icon;
  const SecondaryIcon = config.secondaryAction.icon;
  const BadgeIcon = config.badgeIcon;

  return (
    <div className="bg-white border border-slate-200 rounded-2xl p-5 sm:p-6 shadow-xs space-y-5">
      {/* Header bar */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div className="space-y-1.5 max-w-2xl text-left">
          <div className="flex items-center gap-2">
            <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold border ${config.badgeStyle}`}>
              {BadgeIcon && <BadgeIcon className="w-3.5 h-3.5" />}
              <span>{config.badge}</span>
            </span>
          </div>
          <h2 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
            {config.greetingTitle(nombre)}
          </h2>
          <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
            {config.description}
          </p>
        </div>

        {/* Action buttons + toggle */}
        <div className="flex flex-wrap sm:flex-nowrap items-center gap-2.5 shrink-0">
          <Link
            to={config.primaryAction.to}
            className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs sm:text-sm shadow-xs transition-colors cursor-pointer"
          >
            <PrimaryIcon className="w-4 h-4 shrink-0" />
            <span>{config.primaryAction.label}</span>
          </Link>
          <Link
            to={config.secondaryAction.to}
            className="inline-flex items-center justify-center gap-2 px-3.5 py-2.5 rounded-xl bg-white hover:bg-slate-50 text-slate-700 font-semibold text-xs sm:text-sm border border-slate-300 transition-colors cursor-pointer"
          >
            <SecondaryIcon className="w-4 h-4 shrink-0 text-slate-500" />
            <span>{config.secondaryAction.label}</span>
          </Link>
          <button
            type="button"
            onClick={toggleGuide}
            className="inline-flex items-center justify-center gap-1.5 px-3 py-2.5 rounded-xl text-xs font-medium text-slate-500 hover:text-slate-800 hover:bg-slate-100 transition-colors cursor-pointer"
            title={showGuide ? 'Ocultar guía rápida' : 'Mostrar guía rápida'}
          >
            <span>{showGuide ? 'Ocultar guía' : 'Guía rápida'}</span>
            {showGuide ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
          </button>
        </div>
      </div>

      {/* Collapsible Flow Section */}
      {showGuide && (
        <div className="pt-4 border-t border-slate-100 space-y-3.5">
          <div className="flex items-center justify-between text-left">
            <span className="text-[11px] font-bold tracking-wider text-slate-400 uppercase">
              {config.flowTitle}
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5">
            {config.steps.map((step) => {
              const Icon = step.icon;
              return (
                <div
                  key={step.num}
                  className="bg-slate-50/70 border border-slate-200/90 rounded-xl p-3.5 flex flex-col justify-between hover:bg-slate-50 transition-colors text-left"
                >
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-[11px] font-bold text-slate-400 font-mono">
                        {step.num}
                      </span>
                      <Icon className="w-4 h-4 text-slate-400" />
                    </div>
                    <h4 className="text-xs font-bold text-slate-800 mb-1">{step.title}</h4>
                    <p className="text-[11px] text-slate-500 leading-normal">{step.desc}</p>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Simple Institutional Note */}
          <div className="bg-slate-50 border border-slate-200/80 rounded-xl px-3.5 py-2.5 flex items-center gap-2 text-xs text-slate-600 text-left">
            <Info className="w-3.5 h-3.5 text-slate-400 shrink-0" />
            <span>{config.noteText}</span>
          </div>
        </div>
      )}
    </div>
  );
}

// Backward-compatible alias
export { RoleWelcomeBanner as StudentWelcomeBanner };
