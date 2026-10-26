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
} from 'lucide-react';

interface StudentWelcomeBannerProps {
  nombre?: string;
}

export default function StudentWelcomeBanner({ nombre }: StudentWelcomeBannerProps) {
  const steps = [
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
  ];

  return (
    <div className="bg-white border border-slate-300 rounded-3xl p-6 sm:p-8 shadow-sm space-y-6">
      {/* Hero Welcome Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-5">
        <div className="space-y-2 max-w-2xl text-left">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-blue-50 text-blue-700 border border-blue-200">
            <span>Portal del Estudiante · Soporte Campus</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
            ¡Hola, {nombre || 'Estudiante'}! 👋
          </h2>
          <p className="text-sm text-slate-600 leading-relaxed">
            ¿Detectaste alguna avería en computadoras de laboratorio, proyectores, conectividad Wi-Fi o
            infraestructura de la universidad? Repórtala aquí y nuestro equipo técnico se encargará de
            solucionarla con trazabilidad en tiempo real.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap sm:flex-nowrap items-center gap-3 shrink-0">
          <Link
            to="/dashboard/nueva"
            className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-sm shadow-sm transition-all hover:shadow-md cursor-pointer"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Reportar incidencia</span>
          </Link>
          <Link
            to="/dashboard/incidencias"
            className="inline-flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-sm border border-slate-300 transition-colors cursor-pointer"
          >
            <ClipboardList className="w-4 h-4 text-slate-500" />
            <span>Ver mis tickets</span>
          </Link>
        </div>
      </div>

      {/* Process Flow (4 steps) */}
      <div className="pt-2 border-t border-slate-100">
        <div className="flex items-center justify-between mb-3 text-left">
          <p className="text-xs uppercase font-bold tracking-wider text-slate-500">
            ¿Cómo funciona el proceso de atención?
          </p>
          <span className="hidden sm:inline-flex items-center gap-1 text-xs text-slate-400">
            Flujo paso a paso <ArrowRight className="w-3.5 h-3.5" />
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {steps.map((step) => {
            const Icon = step.icon;
            return (
              <div
                key={step.num}
                className="bg-slate-50/70 border border-slate-200 rounded-2xl p-4 flex flex-col justify-between hover:bg-slate-50 hover:border-slate-300 transition-colors text-left"
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
            <strong className="font-semibold text-amber-950">Consejo útil:</strong> Detallar el pabellón, aula y número de máquina (ej. <em>Lab 204, PC-15</em>) permite que el técnico atienda el problema de inmediato.
          </span>
        </div>

        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/80 border border-amber-300 text-amber-800 font-medium shrink-0 self-start sm:self-auto text-[11px]">
          <Clock className="w-3 h-3 text-amber-600" />
          <span>Soporte presencial: Lun - Vie 7:00 a 22:00</span>
        </div>
      </div>
    </div>
  );
}
