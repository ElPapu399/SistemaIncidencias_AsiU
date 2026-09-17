import { useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPenToSquare } from '@fortawesome/free-solid-svg-icons';
import SearchBar from "./dashboard/SearchBar";
import type { User } from '../types/user';

interface TechnTableProps {
    usuarios: User[];
    onEdit: (user: User) => void;
}

export default function TechnTable({ usuarios, onEdit }: TechnTableProps) {

    const [search, setSearch] = useState('');

    const clearFilters = () => {
        setSearch('');
    };

    const filtered = usuarios.filter(u =>
        u.rol === 'TECNICO' &&
        (
            u.nombre.toLowerCase().includes(search.toLowerCase()) ||
            u.apellido.toLowerCase().includes(search.toLowerCase()) ||
            u.correo.toLowerCase().includes(search.toLowerCase())
        )
    );

    const totalTecnicos = usuarios.filter(u => u.rol === 'TECNICO').length;

    const estadoBadge: Record<string, { bg: string; dot: string }> = {
        Activo: { bg: 'bg-emerald-50 text-emerald-700 border-emerald-300', dot: 'bg-emerald-500' },
        Inactivo: { bg: 'bg-slate-100 text-slate-500 border-slate-300', dot: 'bg-slate-400' },
    };

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

                {search && (
                    <button
                        type="button"
                        onClick={clearFilters}
                        className="px-3 py-2 text-xs font-semibold text-rose-600 bg-rose-50 hover:bg-rose-100 border border-rose-200 rounded-xl transition-colors cursor-pointer"
                    >   
                        Limpiar
                    </button>
                )}
            </div>

            <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm">
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
                            {filtered.map(user => (
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
                                        <p className="text-sm text-slate-600">{user.especialidad || '—'}</p>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span
                                            className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-semibold border ${
                                                estadoBadge[user.estado]?.bg || 'bg-slate-100 text-slate-500 border-slate-300'
                                            }`}
                                        >
                                            <span
                                                className={`w-1.5 h-1.5 rounded-full ${
                                                    estadoBadge[user.estado]?.dot || 'bg-slate-400'
                                                }`}
                                            />
                                            {user.estado}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4">
                                        <p className="text-sm text-slate-500">{user.telefono}</p>
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
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
            <div className="px-5 py-3 bg-slate-50 border-t border-slate-200 text-xs text-slate-500 flex items-center justify-between">
                <span>Mostrando {filtered.length} de {totalTecnicos} técnicos</span>
            </div>
        </div>
    )
}
