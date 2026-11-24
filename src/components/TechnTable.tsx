import Button from './Button';
import { useState, useMemo, useEffect } from 'react';
import { Pencil } from 'lucide-react';
import SearchBar from "./dashboard/SearchBar";
import SortableHeader from './common/SortableHeader';
import {
  type SortDirection,
  compareStrings,
  getNextDirection,
} from '../utils/tableSorting';
import type { User } from '../types/user';

interface TechnTableProps {
    usuarios: User[];
    onEdit: (user: User) => void;
}

const ESTADO_BADGES: Record<string, { bg: string; dot: string }> = {
    Activo: { bg: 'bg-(--tone-emerald-bg-50) text-(--tone-emerald-text-700) border-(--tone-emerald-border-300)', dot: 'bg-emerald-500' },
    Inactivo: { bg: 'bg-(--surface-muted) text-(--text-secondary) border-(--border-color)', dot: 'bg-(--track-color)' },
};

const matchSearch = (u: User, query: string) => {
    if (!query) return true;
    return (
        u.nombre.toLowerCase().includes(query) ||
        u.apellido.toLowerCase().includes(query) ||
        u.correo.toLowerCase().includes(query)
    );
};

const matchEstado = (u: User, estado: string) => {
    if (!estado) return true;
    return (u.estado || 'Activo') === estado;
};

const matchEspecialidad = (u: User, esp: string) => {
    if (!esp) return true;
    return u.especialidad === esp;
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

    const query = search.toLowerCase().trim();

    const matchingForEspecialidad = useMemo(() => {
        return tecnicos.filter(u => matchSearch(u, query) && matchEstado(u, filterEstado));
    }, [tecnicos, query, filterEstado]);

    const availableEspecialidades = useMemo(
        () => [...new Set(matchingForEspecialidad.map(u => u.especialidad).filter(Boolean))] as string[],
        [matchingForEspecialidad]
    );

    const matchingForEstado = useMemo(() => {
        return tecnicos.filter(u => matchSearch(u, query) && matchEspecialidad(u, filterEspecialidad));
    }, [tecnicos, query, filterEspecialidad]);

    const hasActivo = useMemo(() => matchingForEstado.some(u => (u.estado || 'Activo') === 'Activo'), [matchingForEstado]);
    const hasInactivo = useMemo(() => matchingForEstado.some(u => u.estado === 'Inactivo'), [matchingForEstado]);

    const filtered = useMemo(() => {
        return tecnicos.filter(u =>
            matchSearch(u, query) &&
            matchEstado(u, filterEstado) &&
            matchEspecialidad(u, filterEspecialidad)
        );
    }, [tecnicos, query, filterEstado, filterEspecialidad]);

    useEffect(() => {
        if (filterEspecialidad && !availableEspecialidades.includes(filterEspecialidad)) {
            setFilterEspecialidad('');
        }
    }, [availableEspecialidades, filterEspecialidad]);

    useEffect(() => {
        if (filterEstado === 'Activo' && !hasActivo) {
            setFilterEstado('');
        } else if (filterEstado === 'Inactivo' && !hasInactivo) {
            setFilterEstado('');
        }
    }, [filterEstado, hasActivo, hasInactivo]);

    const totalTecnicos = tecnicos.length;
    const hasActiveFilters = search !== '' || filterEstado !== '' || filterEspecialidad !== '';

    const [sortField, setSortField] = useState<string>('nombre');
    const [sortDirection, setSortDirection] = useState<SortDirection>('asc');

    const handleSort = (field: string) => {
        setSortDirection((prevDir) => getNextDirection(sortField, field, prevDir, 'asc'));
        setSortField(field);
    };

    const sortedTecnicos = useMemo(() => {
        return [...filtered].sort((a, b) => {
            switch (sortField) {
                case 'nombre':
                    return compareStrings(`${a.nombre} ${a.apellido}`, `${b.nombre} ${b.apellido}`, sortDirection);
                case 'correo':
                    return compareStrings(a.correo, b.correo, sortDirection);
                case 'especialidad':
                    return compareStrings(a.especialidad, b.especialidad, sortDirection);
                case 'estado':
                    return compareStrings(a.estado, b.estado, sortDirection);
                case 'telefono':
                    return compareStrings(a.telefono, b.telefono, sortDirection);
                default:
                    return 0;
            }
        });
    }, [filtered, sortField, sortDirection]);

    return (
        <div className="bg-(--surface) border border-(--border-color) rounded-2xl overflow-hidden shadow-sm">
            <div className="px-5 py-4 border-b border-(--border-color) bg-(--surface-subtle) flex flex-wrap items-center gap-3">
                <div className="flex w-full min-w-0 flex-none items-center gap-2 lg:w-auto lg:flex-1 lg:min-w-50">
                    <div className="flex-1 min-w-50">
                        <SearchBar
                            value={search}
                            onSearch={setSearch}
                            placeholder="Buscar por nombre o correo..."
                        />
                    </div>
                    {hasActiveFilters && (
                        <Button variant="neutral" appearance="soft" size="custom"
                            type="button"
                            onClick={clearFilters}
                            className="shrink-0 whitespace-nowrap px-3 py-2 text-xs font-semibold border rounded-xl transition-colors cursor-pointer sm:hidden"
                        >   
                            Limpiar
                        </Button>
                    )}
                </div>

                <div className="flex w-full min-w-0 items-center gap-2 overflow-x-auto overscroll-x-contain pb-2 lg:contents">
                    <select
                        aria-label="Filtrar por estado"
                        value={filterEstado}
                        onChange={e => setFilterEstado(e.target.value)}
                        className="px-3 py-2 text-xs font-medium text-(--text-primary) bg-(--surface) border border-(--border-color) rounded-xl focus:outline-none focus:border-blue-400 transition-colors cursor-pointer"
                    >
                        <option value="">Todos los estados</option>
                        {hasActivo && <option value="Activo">Activo</option>}
                        {hasInactivo && <option value="Inactivo">Inactivo</option>}
                    </select>
                    <select
                        aria-label="Filtrar por especialidad"
                        value={filterEspecialidad}
                        onChange={e => setFilterEspecialidad(e.target.value)}
                        className="px-3 py-2 text-xs font-medium text-(--text-primary) bg-(--surface) border border-(--border-color) rounded-xl focus:outline-none focus:border-blue-400 transition-colors cursor-pointer"
                    >
                        <option value="">Todas las especialidades</option>
                        {availableEspecialidades.map(e => (
                            <option key={e} value={e}>{e}</option>
                        ))}
                    </select>
                </div>

                {hasActiveFilters && (
                    <Button variant="neutral" appearance="soft" size="custom"
                        type="button"
                        onClick={clearFilters}
                        className="px-3 py-2 text-xs font-semibold border rounded-xl transition-colors cursor-pointer hidden sm:inline-flex"
                    >   
                        Limpiar
                    </Button>
                )}
            </div>

            <div className="overflow-x-auto overflow-y-auto max-h-130">
                <table className="w-full text-left">
                    <thead className="sticky top-0 bg-(--surface-subtle) z-10">
                        <tr className="border-b border-(--border-color) bg-(--surface-subtle)">
                            <SortableHeader label="Usuario" field="nombre" currentSortField={sortField} currentDirection={sortDirection} onSort={handleSort} className="px-6 py-4" activeColorClass="text-(--tone-violet-text-600)" />
                            <SortableHeader label="Correo" field="correo" currentSortField={sortField} currentDirection={sortDirection} onSort={handleSort} className="px-6 py-4" activeColorClass="text-(--tone-violet-text-600)" />
                            <SortableHeader label="Especialidad" field="especialidad" currentSortField={sortField} currentDirection={sortDirection} onSort={handleSort} className="px-6 py-4" activeColorClass="text-(--tone-violet-text-600)" />
                            <SortableHeader label="Estado" field="estado" currentSortField={sortField} currentDirection={sortDirection} onSort={handleSort} className="px-6 py-4" activeColorClass="text-(--tone-violet-text-600)" />
                            <SortableHeader label="Teléfono" field="telefono" currentSortField={sortField} currentDirection={sortDirection} onSort={handleSort} className="px-6 py-4" activeColorClass="text-(--tone-violet-text-600)" />
                            <th scope="col" className="px-6 py-4 text-xs font-semibold uppercase tracking-wider text-(--text-secondary) text-center">Acciones</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-(--border-color)">
                        {sortedTecnicos.length === 0 ? (
                            <tr>
                                <td colSpan={6} className="px-6 py-12 text-center text-sm text-(--text-secondary)">
                                    No se encontraron técnicos con los filtros seleccionados.
                                </td>
                            </tr>
                        ) : (
                            sortedTecnicos.map(user => {
                                const badge = ESTADO_BADGES[user.estado] || { bg: 'bg-(--surface-muted) text-(--text-secondary) border-(--border-color)', dot: 'bg-(--track-color)' };
                                return (
                                    <tr key={user.id} className="hover:bg-(--surface-subtle) transition-colors">
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                <div className="w-9 h-9 rounded-xl bg-linear-to-br from-violet-500 to-purple-600 flex items-center justify-center text-white text-sm font-bold shrink-0">
                                                    {user.nombre.charAt(0)}{user.apellido.charAt(0)}
                                                </div>
                                                <p className="text-sm font-semibold text-(--text-primary)">
                                                    {user.nombre} {user.apellido}
                                                </p>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <p className="text-sm text-(--text-secondary)">{user.correo}</p>
                                        </td>
                                        <td className="px-6 py-4">
                                            {user.rol === 'TECNICO_GENERAL' ? (
                                                <div>
                                                    <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold bg-(--tone-blue-bg-50) text-(--tone-blue-text-700) border border-(--tone-blue-border-200)">
                                                        Soporte General
                                                    </span>
                                                    <p className="text-[11px] text-(--text-secondary) mt-0.5">Mesa de ayuda / Asignador</p>
                                                </div>
                                            ) : (
                                                <div>
                                                    <p className="text-sm font-semibold text-(--text-primary)">{user.especialidad || 'General'}</p>
                                                    <span className="text-[11px] text-(--tone-amber-text-700) font-medium">Soporte Especializado</span>
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
                                            <p className="text-sm text-(--text-secondary)">{user.telefono || '—'}</p>
                                        </td>
                                        <td className="px-6 py-4 text-center">
                                            <Button variant="info" appearance="soft" size="custom"
                                                type="button"
                                                onClick={() => onEdit(user)}
                                                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors cursor-pointer"
                                            >
                                                <Pencil className="h-3.5 w-3.5" />
                                                Editar
                                            </Button>
                                        </td>
                                    </tr>
                                );
                            })
                        )}
                    </tbody>
                </table>
            </div>
            <div className="px-5 py-3 bg-(--surface-subtle) border-t border-(--border-color) text-xs text-(--text-secondary) flex items-center justify-between">
                <span>Mostrando {sortedTecnicos.length} de {totalTecnicos} técnicos</span>
            </div>
        </div>
    );
}
