import { useState, useMemo, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPenToSquare } from '@fortawesome/free-solid-svg-icons';
import SearchBar from "./dashboard/SearchBar";
import { formatDate } from './dashboard/IncidentBadges';
import SortableHeader from './common/SortableHeader';
import {
  type SortDirection,
  compareDates,
  compareStrings,
  getNextDirection,
} from '../utils/tableSorting';
import type { User } from '../types/user';

interface StudentTableProps {
    usuarios: User[];
    onEdit: (user: User) => void;
}

const ESTADO_BADGES: Record<string, { bg: string; dot: string }> = {
    Activo: { bg: 'bg-emerald-50 text-emerald-700 border-emerald-300', dot: 'bg-emerald-500' },
    Inactivo: { bg: 'bg-slate-100 text-slate-500 border-slate-300', dot: 'bg-slate-400' },
};

const matchSearch = (u: User, query: string) => {
    if (!query) return true;
    return (
        u.nombre.toLowerCase().includes(query) ||
        u.apellido.toLowerCase().includes(query) ||
        u.correo.toLowerCase().includes(query)
    );
};

const matchCarrera = (u: User, carrera: string) => {
    if (!carrera) return true;
    return u.carrera === carrera;
};

const matchEstado = (u: User, estado: string) => {
    if (!estado) return true;
    return (u.estado || 'Activo') === estado;
};

export default function StudentTable({ usuarios, onEdit }: StudentTableProps) {
    const [search, setSearch] = useState('');
    const [filterCarrera, setFilterCarrera] = useState('');
    const [filterEstado, setFilterEstado] = useState('');

    const clearFilters = () => {
        setSearch('');
        setFilterCarrera('');
        setFilterEstado('');
    };

    const estudiantes = useMemo(
        () => usuarios.filter(u => !u.rol || u.rol === 'ESTUDIANTE'),
        [usuarios]
    );

    const query = search.toLowerCase().trim();

    const matchingForCarrera = useMemo(() => {
        return estudiantes.filter(u => matchSearch(u, query) && matchEstado(u, filterEstado));
    }, [estudiantes, query, filterEstado]);

    const availableCarreras = useMemo(
        () => [...new Set(matchingForCarrera.map(u => u.carrera).filter(Boolean))] as string[],
        [matchingForCarrera]
    );

    const matchingForEstado = useMemo(() => {
        return estudiantes.filter(u => matchSearch(u, query) && matchCarrera(u, filterCarrera));
    }, [estudiantes, query, filterCarrera]);

    const hasActivo = useMemo(() => matchingForEstado.some(u => (u.estado || 'Activo') === 'Activo'), [matchingForEstado]);
    const hasInactivo = useMemo(() => matchingForEstado.some(u => u.estado === 'Inactivo'), [matchingForEstado]);

    const filtered = useMemo(() => {
        return estudiantes.filter(u =>
            matchSearch(u, query) &&
            matchCarrera(u, filterCarrera) &&
            matchEstado(u, filterEstado)
        );
    }, [estudiantes, query, filterCarrera, filterEstado]);

    useEffect(() => {
        if (filterCarrera && !availableCarreras.includes(filterCarrera)) {
            setFilterCarrera('');
        }
    }, [availableCarreras, filterCarrera]);

    useEffect(() => {
        if (filterEstado === 'Activo' && !hasActivo) {
            setFilterEstado('');
        } else if (filterEstado === 'Inactivo' && !hasInactivo) {
            setFilterEstado('');
        }
    }, [filterEstado, hasActivo, hasInactivo]);

    const totalEstudiantes = estudiantes.length;
    const hasActiveFilters = search !== '' || filterCarrera !== '' || filterEstado !== '';

    const [sortField, setSortField] = useState<string>('fechaCreacion');
    const [sortDirection, setSortDirection] = useState<SortDirection>('desc');

    const handleSort = (field: string) => {
        const defaultDir: SortDirection = field === 'fechaCreacion' ? 'desc' : 'asc';
        setSortDirection((prevDir) => getNextDirection(sortField, field, prevDir, defaultDir));
        setSortField(field);
    };

    const sortedEstudiantes = useMemo(() => {
        return [...filtered].sort((a, b) => {
            switch (sortField) {
                case 'nombre':
                    return compareStrings(`${a.nombre} ${a.apellido}`, `${b.nombre} ${b.apellido}`, sortDirection);
                case 'correo':
                    return compareStrings(a.correo, b.correo, sortDirection);
                case 'carrera':
                    return compareStrings(a.carrera, b.carrera, sortDirection);
                case 'estado':
                    return compareStrings(a.estado, b.estado, sortDirection);
                case 'fechaCreacion':
                    return compareDates(a.fechaCreacion, b.fechaCreacion, sortDirection);
                default:
                    return 0;
            }
        });
    }, [filtered, sortField, sortDirection]);

    return (
        <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm">
            <div className="px-5 py-4 border-b border-slate-200 bg-slate-50 flex flex-wrap items-center gap-3">
                <div className="flex-1 min-w-[200px]">
                    <SearchBar
                        value={search}
                        onSearch={setSearch}
                        placeholder="Buscar por nombre, apellido o correo..."
                    />
                </div>

                <select
                    value={filterCarrera}
                    onChange={e => setFilterCarrera(e.target.value)}
                    className="px-3 py-2 text-xs font-medium text-slate-700 bg-white border border-slate-300 rounded-xl focus:outline-none focus:border-blue-400 transition-colors cursor-pointer"
                >
                    <option value="">Todas las carreras</option>
                    {availableCarreras.map(c => (
                        <option key={c} value={c}>{c}</option>
                    ))}
                </select>

                <select
                    value={filterEstado}
                    onChange={e => setFilterEstado(e.target.value)}
                    className="px-3 py-2 text-xs font-medium text-slate-700 bg-white border border-slate-300 rounded-xl focus:outline-none focus:border-blue-400 transition-colors cursor-pointer"
                >
                    <option value="">Todos los estados</option>
                    {hasActivo && <option value="Activo">Activos</option>}
                    {hasInactivo && <option value="Inactivo">Inactivos</option>}
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

            <div className="overflow-x-auto overflow-y-auto max-h-[520px]">
                <table className="w-full text-left">
                    <thead className="sticky top-0 bg-slate-50 z-10">
                        <tr className="border-b border-slate-200 bg-slate-50">
                            <SortableHeader label="Usuario" field="nombre" currentSortField={sortField} currentDirection={sortDirection} onSort={handleSort} className="px-6 py-4" activeColorClass="text-violet-600" />
                            <SortableHeader label="Correo" field="correo" currentSortField={sortField} currentDirection={sortDirection} onSort={handleSort} className="px-6 py-4" activeColorClass="text-violet-600" />
                            <SortableHeader label="Carrera" field="carrera" currentSortField={sortField} currentDirection={sortDirection} onSort={handleSort} className="px-6 py-4" activeColorClass="text-violet-600" />
                            <SortableHeader label="Estado" field="estado" currentSortField={sortField} currentDirection={sortDirection} onSort={handleSort} className="px-6 py-4" activeColorClass="text-violet-600" />
                            <SortableHeader label="Registro" field="fechaCreacion" currentSortField={sortField} currentDirection={sortDirection} onSort={handleSort} className="px-6 py-4" activeColorClass="text-violet-600" />
                            <th scope="col" className="px-6 py-4 text-xs font-semibold uppercase tracking-wider text-slate-500 text-center">Acciones</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                        {sortedEstudiantes.length === 0 ? (
                            <tr>
                                <td colSpan={6} className="px-6 py-12 text-center text-sm text-slate-500">
                                    No se encontraron estudiantes con los filtros seleccionados.
                                </td>
                            </tr>
                        ) : (
                            sortedEstudiantes.map(user => {
                                const badge = ESTADO_BADGES[user.estado] || ESTADO_BADGES['Activo'];
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
                                            <p className="text-sm text-slate-600">{user.carrera || '—'}</p>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span
                                                className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-semibold border ${badge.bg}`}
                                            >
                                                <span className={`w-1.5 h-1.5 rounded-full ${badge.dot}`} />
                                                {user.estado || 'Activo'}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <p className="text-sm text-slate-500">{formatDate(user.fechaCreacion)}</p>
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
                <span>Mostrando {sortedEstudiantes.length} de {totalEstudiantes} estudiantes</span>
            </div>
        </div>
    );
}
