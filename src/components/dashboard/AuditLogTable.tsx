import { useState, useMemo } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faMagnifyingGlass,
  faXmark,
  faShieldHalved,
  faArrowRight,
  faUser,
  faComputer,
  faTicket,
} from '@fortawesome/free-solid-svg-icons';

import type { AuditoriaLog } from '../../services/auditoriaService';
import { formatDate } from './IncidentBadges';
import { TableSkeleton } from './SkeletonLoaders';

interface AuditLogTableProps {
  logs: AuditoriaLog[];
  loading: boolean;
  error?: string;
  onRefresh?: () => void;
}

const ACTION_CONFIG: Record<
  string,
  { label: string; bg: string; text: string; border: string }
> = {
  CREACION: {
    label: 'Creación',
    bg: 'bg-emerald-50',
    text: 'text-emerald-700',
    border: 'border-emerald-200',
  },
  ASIGNACION: {
    label: 'Asignación',
    bg: 'bg-violet-50',
    text: 'text-violet-700',
    border: 'border-violet-200',
  },
  CAMBIO_ESTADO: {
    label: 'Cambio de Estado',
    bg: 'bg-blue-50',
    text: 'text-blue-700',
    border: 'border-blue-200',
  },
  REASIGNACION: {
    label: 'Reasignación',
    bg: 'bg-purple-50',
    text: 'text-purple-700',
    border: 'border-purple-200',
  },
  SOLICITUD_REASIGNACION: {
    label: 'Sol. Reasignación',
    bg: 'bg-violet-50',
    text: 'text-violet-700',
    border: 'border-violet-200',
  },
  CALIFICACION: {
    label: 'Calificación',
    bg: 'bg-amber-50',
    text: 'text-amber-700',
    border: 'border-amber-200',
  },
  ESTADO_EQUIPO: {
    label: 'Taller de Equipos',
    bg: 'bg-amber-50',
    text: 'text-amber-700',
    border: 'border-amber-200',
  },
};

const ROLE_BADGES: Record<string, string> = {
  ADMIN: 'bg-rose-100 text-rose-800',
  TECNICO_GENERAL: 'bg-purple-100 text-purple-800',
  TECNICO_ESPECIALISTA: 'bg-blue-100 text-blue-800',
  ESTUDIANTE: 'bg-slate-100 text-slate-700',
};

export default function AuditLogTable({
  logs,
  loading,
  error,
  onRefresh,
}: AuditLogTableProps) {
  const [busqueda, setBusqueda] = useState('');
  const [filtroAccion, setFiltroAccion] = useState('todas');
  const [filtroTipo, setFiltroTipo] = useState<'TODOS' | 'INCIDENCIA' | 'EQUIPO'>('TODOS');

  const logsFiltrados = useMemo(() => {
    const q = busqueda.trim().toLowerCase();

    return logs.filter((log) => {
      // Filtro de tipo
      if (filtroTipo !== 'TODOS' && log.tipo !== filtroTipo) return false;

      // Filtro de acción
      if (filtroAccion !== 'todas') {
        const accionUpper = log.tipoAccion?.toUpperCase() || '';
        if (filtroAccion === 'ASIGNACION' && accionUpper !== 'ASIGNACION') return false;
        if (filtroAccion === 'REASIGNACION' && !accionUpper.includes('REASIGNACION')) return false;
        if (filtroAccion === 'CAMBIO_ESTADO' && accionUpper !== 'CAMBIO_ESTADO') return false;
        if (filtroAccion === 'CALIFICACION' && accionUpper !== 'CALIFICACION') return false;
        if (filtroAccion === 'CREACION' && !accionUpper.includes('CREACION')) return false;
        if (filtroAccion === 'ESTADO_EQUIPO' && accionUpper !== 'ESTADO_EQUIPO') return false;
      }

      // Buscador
      if (!q) return true;
      return (
        log.usuarioNombre.toLowerCase().includes(q) ||
        log.usuarioEmail.toLowerCase().includes(q) ||
        log.entidadCodigo.toLowerCase().includes(q) ||
        log.entidadNombre.toLowerCase().includes(q) ||
        log.detalle.toLowerCase().includes(q)
      );
    });
  }, [logs, busqueda, filtroAccion, filtroTipo]);

  return (
    <div className="space-y-4 text-left">
      {/* Barra de Filtros */}
      <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-xs space-y-3">
        <div className="flex flex-col md:flex-row gap-3">
          <div className="relative flex-1">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
              <FontAwesomeIcon icon={faMagnifyingGlass} className="text-sm" />
            </div>
            <input
              type="text"
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
              placeholder="Buscar por usuario, correo, código de ticket o PC..."
              className="w-full pl-10 pr-9 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs sm:text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none focus:border-blue-600 focus:bg-white transition-colors"
            />
            {busqueda && (
              <button
                type="button"
                onClick={() => setBusqueda('')}
                className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                <FontAwesomeIcon icon={faXmark} className="text-xs" />
              </button>
            )}
          </div>

          <div className="flex items-center gap-2 overflow-x-auto pb-1 md:pb-0">
            <select
              value={filtroTipo}
              onChange={(e) => setFiltroTipo(e.target.value as 'TODOS' | 'INCIDENCIA' | 'EQUIPO')}
              className="px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs sm:text-sm text-slate-700 font-medium focus:outline-none focus:border-blue-600 shrink-0"
            >
              <option value="TODOS">Todos los Módulos</option>
              <option value="INCIDENCIA">Solo Incidencias</option>
              <option value="EQUIPO">Solo Equipos / Taller</option>
            </select>

            <select
              value={filtroAccion}
              onChange={(e) => setFiltroAccion(e.target.value)}
              className="px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs sm:text-sm text-slate-700 font-medium focus:outline-none focus:border-blue-600 shrink-0"
            >
              <option value="todas">Todas las Acciones</option>
              <option value="CREACION">Creación de Ticket</option>
              <option value="ASIGNACION">Asignaciones Iniciales</option>
              <option value="REASIGNACION">Reasignaciones de Técnico</option>
              <option value="CAMBIO_ESTADO">Cambios de Estado</option>
              <option value="CALIFICACION">Calificaciones y Cierre</option>
              <option value="ESTADO_EQUIPO">Taller de Equipos</option>
            </select>
          </div>
        </div>
      </div>

      {/* Manejo de Error */}
      {error && (
        <div className="p-4 bg-rose-50 border border-rose-200 text-rose-700 rounded-2xl text-xs sm:text-sm flex items-center justify-between">
          <span>{error}</span>
          {onRefresh && (
            <button
              type="button"
              onClick={onRefresh}
              className="underline font-bold cursor-pointer hover:text-rose-900"
            >
              Reintentar
            </button>
          )}
        </div>
      )}

      {/* Tabla de Eventos */}
      {loading ? (
        <TableSkeleton rows={6} showFilters={true} />
      ) : logsFiltrados.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-2xl border border-slate-200 p-6">
          <div className="w-14 h-14 mx-auto rounded-2xl bg-slate-100 flex items-center justify-center mb-3">
            <FontAwesomeIcon icon={faShieldHalved} className="text-2xl text-slate-400" />
          </div>
          <h4 className="text-base font-bold text-slate-800">
            No se encontraron eventos de auditoría
          </h4>
          <p className="text-xs text-slate-500 mt-1">
            {busqueda
              ? 'No hay registros que coincidan con los criterios de búsqueda ingresados.'
              : 'Aún no se han registrado eventos en el sistema.'}
          </p>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs sm:text-sm">
              <thead className="bg-slate-50 text-slate-500 font-semibold border-b border-slate-200 text-xs uppercase tracking-wider">
                <tr>
                  <th className="px-5 py-3.5">Fecha y Hora</th>
                  <th className="px-5 py-3.5">Usuario Responsable</th>
                  <th className="px-5 py-3.5">Acción</th>
                  <th className="px-5 py-3.5">Entidad Afectada</th>
                  <th className="px-5 py-3.5">Transición</th>
                  <th className="px-5 py-3.5">Detalle / Motivo</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {logsFiltrados.map((log) => {
                  const cfg = ACTION_CONFIG[log.tipoAccion] || {
                    label: log.tipoAccion,
                    bg: 'bg-slate-50',
                    text: 'text-slate-700',
                    border: 'border-slate-200',
                  };
                  const rolBadge =
                    ROLE_BADGES[log.usuarioRol] || 'bg-slate-100 text-slate-600';
                  const isInc = log.tipo === 'INCIDENCIA';

                  return (
                    <tr key={log.id} className="hover:bg-slate-50/70 transition-colors">
                      {/* Fecha */}
                      <td className="px-5 py-3.5 whitespace-nowrap text-xs text-slate-500 font-mono">
                        {formatDate(log.fecha)}
                      </td>

                      {/* Usuario */}
                      <td className="px-5 py-3.5">
                        <div className="flex items-center gap-2">
                          <div className="w-7 h-7 rounded-full bg-slate-100 text-slate-600 flex items-center justify-center shrink-0 text-xs">
                            <FontAwesomeIcon icon={faUser} />
                          </div>
                          <div>
                            <div className="font-bold text-slate-900 leading-snug">
                              {log.usuarioNombre}
                            </div>
                            <div className="flex items-center gap-1.5 mt-0.5">
                              <span
                                className={`text-[10px] font-bold px-1.5 py-0.2 rounded uppercase ${rolBadge}`}
                              >
                                {log.usuarioRol || 'Usuario'}
                              </span>
                              {log.usuarioEmail && (
                                <span className="text-[11px] text-slate-400 truncate max-w-35">
                                  {log.usuarioEmail}
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* Acción */}
                      <td className="px-5 py-3.5 whitespace-nowrap">
                        <span
                          className={`inline-flex items-center px-2.5 py-0.5 rounded-md text-xs font-semibold border ${cfg.bg} ${cfg.text} ${cfg.border}`}
                        >
                          {cfg.label}
                        </span>
                      </td>

                      {/* Entidad */}
                      <td className="px-5 py-3.5">
                        <div className="flex items-center gap-1.5">
                          <FontAwesomeIcon
                            icon={isInc ? faTicket : faComputer}
                            className={`text-xs ${
                              isInc ? 'text-blue-500' : 'text-amber-500'
                            }`}
                          />
                          <span className="font-mono text-xs font-bold text-slate-800">
                            {log.entidadCodigo || '—'}
                          </span>
                        </div>
                        {log.entidadNombre && (
                          <p className="text-[11px] text-slate-500 truncate max-w-45 mt-0.5">
                            {log.entidadNombre}
                          </p>
                        )}
                      </td>

                      {/* Transición */}
                      <td className="px-5 py-3.5 text-xs whitespace-nowrap">
                        {log.estadoNuevo ? (
                          <div className="flex items-center gap-1 font-medium">
                            <span className="text-slate-400">
                              {log.estadoAnterior || 'Inicial'}
                            </span>
                            <FontAwesomeIcon
                              icon={faArrowRight}
                              className="text-[10px] text-slate-300"
                            />
                            <span className="text-slate-900 font-bold">
                              {log.estadoNuevo}
                            </span>
                          </div>
                        ) : (
                          <span className="text-slate-400">—</span>
                        )}
                      </td>

                      {/* Detalle */}
                      <td className="px-5 py-3.5 text-xs max-w-xs">
                        <p className="text-slate-700 line-clamp-2 leading-relaxed">
                          {log.detalle || 'Sin observaciones'}
                        </p>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          <div className="px-5 py-3 bg-slate-50 border-t border-slate-200 text-xs text-slate-500 flex items-center justify-between">
            <span>
              Mostrando {logsFiltrados.length} de {logs.length} eventos recientes de auditoría
            </span>
          </div>
        </div>
      )}
    </div>
  );
}

