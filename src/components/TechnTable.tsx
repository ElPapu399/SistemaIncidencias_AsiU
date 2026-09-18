import { useState, useMemo } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPenToSquare } from '@fortawesome/free-solid-svg-icons';
import SearchBar from "./dashboard/SearchBar";
import type { User } from '../types/user';

interface TechnTableProps {
    usuarios: User[];
    onEdit: (user: User) => void;
}

const ESTADO_BADGES: Record<string, { bg: string; dot: string }> = {
    Activo: { bg: 'bg-emerald-50 text-emerald-700 border-emerald-300', dot: 'bg-emerald-500' },
    Inactivo: { bg: 'bg-slate-100 text-slate-500 border-slate-300', dot: 'bg-slate-400' },
};

export default function TechnTable({ usuarios, onEdit }: TechnTableProps) {
    const [search, setSearch] = useState('');
    const [filterEstado, setFilterEstado] = useState('');
    const [filterEspecialidad, setFilterEspecialidad] = useState('');

    const clearFilters = () => {
        setSearch('');
        setFilterEstado('');
        setFilterEspecialidad('');
    };

    const tecnicos = useMemo(
        () => usuarios.filter(u => !u.rol || u.rol === 'TECNICO' || u.rol === 'TECNICO_GENERAL' || u.rol === 'TECNICO_ESPECIALISTA'),
        [usuarios]
    );

    // Extraer especialidades únicas para el filtro
    const especialidades = useMemo(
        () => [...new Set(tecnicos.map(u => u.especialidad).filter(Boolean))] as string[],
        [tecnicos]
    );

    // Filtrado memoizado para rendimiento
    const filtered = useMemo(() => {
        const query = search.toLowerCase().trim();
        return tecnicos.filter(u => {
            const matchSearch = !query ||
                u.nombre.toLowerCase().includes(query) ||
                u.apellido.toLowerCase().includes(query) ||
                u.correo.toLowerCase().includes(query);
            const matchEstado = !filterEstado || u.estado === filterEstado;
            const matchEspecialidad = !filterEspecialidad || u.especialidad === filterEspecialidad;

            return matchSearch && matchEstado && matchEspecialidad;
        });
    }, [tecnicos, search, filterEstado, filterEspecialidad]);

    const totalTecnicos = tecnicos.length;
    const hasActiveFilters = search !== '' || filterEstado !== '' || filterEspecialidad !== '';

    return (
        <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm">
            <div className="px-5 py-4 border-b border-slate-200 bg-slate-50 flex flex-wrap items-center gap-3">
                <div className="flex-1 min-w-[200px]">
                    <SearchBar
                        value={search}
                        onSearch={setSearch}
                        placeholder="Buscar por nombre o correo..."
                    />
                </div>

                <select
                    value={filterEstado}
                    onChange={e => setFilterEstado(e.target.value)}
                    className="px-3 py-2 text-xs font-medium text-slate-700 bg-white border border-slate-300 rounded-xl focus:outline-none focus:border-blue-400 transition-colors cursor-pointer"
                >
                    <option value="">Todos los estados</option>
                    <option value="Activo">Activo</option>
                    <option value="Inactivo">Inactivo</option>
                </select>

                <select
                    value={filterEspecialidad}
                    onChange={e => setFilterEspecialidad(e.target.value)}
                    className="px-3 py-2 text-xs font-medium text-slate-700 bg-white border border-slate-300 rounded-xl focus:outline-none focus:border-blue-400 transition-colors cursor-pointer"
                >
                    <option value="">Todas las especialidades</option>
                    {especialidades.map(e => (
                        <option key={e} value={e}>{e}</option>
                    ))}
                </select>

                {hasActiveFilters && (
                    <button
                        type="button"
                        onClick={clearFilters}
                        className="px-3 py-2 text-xs font-semibold text-rose-600 bg-rose-50 hover:bg-rose-100 border border-rose-200 rounded-xl transition-colors cursor-pointer"
                    >   
                        Limpiar
                    </button>
                )}
            </div>

            <div className="overflow-x-auto overflow-y-auto max-h-[600px]">
                <table className="w-full text-left">
                    <thead className="sticky top-0 bg-slate-50 z-10">
                        <tr className="border-b border-slate-200 bg-slate-50">
                            <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wider text-slate-500">Usuario</th>
                            <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wider text-slate-500">Correo</th>
                            <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wider text-slate-500">Especialidad</th>
                            <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wider text-slate-500">Estado</th>
                            <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wider text-slate-500">Teléfono</th>
                            <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wider text-slate-500 text-center">Acciones</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                        {filtered.length === 0 ? (
                            <tr>
                                <td colSpan={6} className="px-6 py-12 text-center text-sm text-slate-500">
                                    No se encontraron técnicos con los filtros seleccionados.
                                </td>
                            </tr>
                        ) : (
                            filtered.map(user => {
                                const badge = ESTADO_BADGES[user.estado] || { bg: 'bg-slate-100 text-slate-500 border-slate-300', dot: 'bg-slate-400' };
                                return (
                                    <tr key={user.id} className="hover:bg-slate-50 transition-colors">
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center text-white text-sm font-bold shrink-0">
                                                    {user.nombre.charAt(0)}{user.apellido.charAt(0)}
                                                </div>
                                                <p className="text-sm font-semibold text-slate-900">
                                                    {user.nombre} {user.apellido}
                                                </p>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <p className="text-sm text-slate-600">{user.correo}</p>
                                        </td>
                                        <td className="px-6 py-4">
                                            {user.rol === 'TECNICO_GENERAL' ? (
                                                <div>
                                                    <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold bg-blue-50 text-blue-700 border border-blue-200">
                                                        Soporte General
                                                    </span>
                                                    <p className="text-[11px] text-slate-400 mt-0.5">Mesa de ayuda / Asignador</p>
                                                </div>
                                            ) : (
                                                <div>
                                                    <p className="text-sm font-semibold text-slate-800">{user.especialidad || 'General'}</p>
                                                    <span className="text-[11px] text-amber-700 font-medium">Soporte Especializado</span>
                                                </div>
                                            )}
                                        </td>
                                        <td className="px-6 py-4">
                                            <span
                                                className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-semibold border ${badge.bg}`}
                                            >
                                                <span className={`w-1.5 h-1.5 rounded-full ${badge.dot}`} />
                                                {user.estado}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <p className="text-sm text-slate-500">{user.telefono || '—'}</p>
                                        </td>
                                        <td className="px-6 py-4 text-center">
                                            <button
                                                type="button"
                                                onClick={() => onEdit(user)}
                                                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-blue-600 bg-blue-50 hover:bg-blue-100 border border-blue-200 transition-colors cursor-pointer"
                                            >
                                                <FontAwesomeIcon icon={faPenToSquare} />
                                                Editar
                                            </button>
                                        </td>
                                    </tr>
                                );
                            })
                        )}
                    </tbody>
                </table>
            </div>
            <div className="px-5 py-3 bg-slate-50 border-t border-slate-200 text-xs text-slate-500 flex items-center justify-between">
                <span>Mostrando {filtered.length} de {totalTecnicos} técnicos</span>
            </div>
        </div>
    );
}
