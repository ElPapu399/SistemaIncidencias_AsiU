import { useState, useEffect, useCallback } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPlus, faPenToSquare, faSpinner, faUsers } from '@fortawesome/free-solid-svg-icons';
import Header from '../components/dashboard/Header';
import UserFormModal from '../components/dashboard/UserForm';
import type { User } from '../types/user';

const API_BASE = 'http://localhost:8080/api';

const rolBadge: Record<string, string> = {
    ADMIN: 'bg-violet-500/15 text-violet-400 border-violet-500/30',
    TECNICO: 'bg-blue-500/15 text-blue-400 border-blue-500/30',
    ESTUDIANTE: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30',
};

interface UsuariosPageProps {
    title: string;
    description: string;
}

export default function UsuariosPage({ title }: UsuariosPageProps) {
    const [usuarios, setUsuarios] = useState<User[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    const [modalOpen, setModalOpen] = useState(false);
    const [editingUser, setEditingUser] = useState<User | null>(null);

    const cargarUsuarios = useCallback(async () => {
        setLoading(true);
        setError('');
        try {
            const response = await fetch(`${API_BASE}/usuarios`);
            if (response.ok) {
                const data = await response.json();
                setUsuarios(data);
            } else {
                setError('Error al cargar usuarios');
            }
        } catch {
            setError('No se pudo conectar al servidor');
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        cargarUsuarios();
    }, [cargarUsuarios]);

    const handleCreate = () => {
        setEditingUser(null);
        setModalOpen(true);
    };

    const handleEdit = (user: User) => {
        setEditingUser(user);
        setModalOpen(true);
    };

    const handleSave = () => {
        cargarUsuarios();
    };

    const formatDate = (dateStr: string) => {
        return new Date(dateStr).toLocaleDateString('es-PE', {
            day: '2-digit',
            month: 'short',
            year: 'numeric',
        });
    };

    return (
        <>
            <Header title={title} />
            <main className="flex-1 overflow-y-auto p-6 space-y-6 bg-slate-200">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div className="text-left">
                        <h3 className="text-2xl font-bold text-black">Gestión de Usuarios</h3>
                        <p className="text-sm text-slate-500 mt-1">
                            {usuarios.length} usuario{usuarios.length !== 1 ? 's' : ''} registrado{usuarios.length !== 1 ? 's' : ''} en el sistema
                        </p>
                    </div>
                    <button
                        type="button"
                        onClick={handleCreate}
                        className="inline-flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-yellow-400 to-orange-500 hover:from-yellow-500 hover:to-orange-600 text-slate-950 rounded-xl font-bold text-sm transition-all duration-200 hover:scale-[1.02] active:scale-[0.98] shadow-lg shadow-orange-500/10 cursor-pointer"
                    >
                        <FontAwesomeIcon icon={faPlus} />
                        Nuevo usuario
                    </button>
                </div>

                {/* Error state */}
                {error && (
                    <div className="text-red-600 text-sm bg-red-100 border border-red-300 rounded-xl px-4 py-3">
                        {error}
                    </div>
                )}

                {/* Loading state */}
                {loading ? (
                    <div className="flex items-center justify-center py-20">
                        <FontAwesomeIcon icon={faSpinner} spin className="text-3xl text-slate-400" />
                    </div>
                ) : usuarios.length === 0 ? (
                    /* Empty state */
                    <div className="text-center py-20">
                        <div className="w-16 h-16 mx-auto rounded-2xl bg-slate-300 flex items-center justify-center mb-4">
                            <FontAwesomeIcon icon={faUsers} className="text-2xl text-slate-500" />
                        </div>
                        <h4 className="text-lg font-semibold text-black">Sin usuarios</h4>
                        <p className="text-sm text-slate-500 mt-1">
                            Aún no hay usuarios registrados. Crea el primero.
                        </p>
                    </div>
                ) : (
                    /* Table */
                    <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm">
                        <div className="overflow-x-auto">
                            <table className="w-full text-left">
                                <thead>
                                    <tr className="border-b border-slate-200 bg-slate-50">
                                        <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wider text-slate-500">
                                            Usuario
                                        </th>
                                        <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wider text-slate-500">
                                            Correo
                                        </th>
                                        <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wider text-slate-500">
                                            Rol
                                        </th>
                                        <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wider text-slate-500">
                                            Especialidad
                                        </th>
                                        <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wider text-slate-500">
                                            Registro
                                        </th>
                                        <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wider text-slate-500 text-center">
                                            Acciones
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100">
                                    {usuarios.map(user => (
                                        <tr
                                            key={user.id}
                                            className="hover:bg-slate-50 transition-colors"
                                        >
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center text-white text-sm font-bold shrink-0">
                                                        {user.nombre.charAt(0)}{user.apellido.charAt(0)}
                                                    </div>
                                                    <div>
                                                        <p className="text-sm font-semibold text-slate-900">
                                                            {user.nombre} {user.apellido}
                                                        </p>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <p className="text-sm text-slate-600">{user.correo}</p>
                                            </td>
                                            <td className="px-6 py-4">
                                                <span
                                                    className={`inline-flex px-3 py-1 rounded-lg text-xs font-bold border ${rolBadge[user.rol] || 'bg-slate-500/15 text-slate-400 border-slate-500/30'
                                                        }`}
                                                >
                                                    {user.rol}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4">
                                                <p className="text-sm text-slate-600">
                                                    {user.especialidad || '—'}
                                                </p>
                                            </td>
                                            <td className="px-6 py-4">
                                                <p className="text-sm text-slate-500">
                                                    {formatDate(user.fechaCreacion)}
                                                </p>
                                            </td>
                                            <td className="px-6 py-4 text-center">
                                                <button
                                                    type="button"
                                                    onClick={() => handleEdit(user)}
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
                )}
            </main>

            <UserFormModal
                isOpen={modalOpen}
                onClose={() => setModalOpen(false)}
                onSave={handleSave}
                editingUser={editingUser}
            />
        </>
    );
}
