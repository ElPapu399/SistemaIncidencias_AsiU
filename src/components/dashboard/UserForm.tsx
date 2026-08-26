import { useState, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faXmark, faSpinner } from '@fortawesome/free-solid-svg-icons';
import type { User, Role, Especialidad } from '../../types/user';

interface UserFormProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: () => void;
    editingUser: User | null;
}

const API_BASE = 'http://localhost:8080/api';

export default function UserFormModal({ isOpen, onClose, onSave, editingUser }: UserFormProps) {
    const [nombre, setNombre] = useState('');
    const [apellido, setApellido] = useState('');
    const [correo, setCorreo] = useState('');
    const [password, setPassword] = useState('');
    const [rolId, setRolId] = useState<number>(0);
    const [especialidadId, setEspecialidadId] = useState<number | null>(null);

    const [roles, setRoles] = useState<Role[]>([]);
    const [especialidades, setEspecialidades] = useState<Especialidad[]>([]);

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const isEditing = editingUser !== null;

    // para cargar listas al inicio
    useEffect(() => {
        if (!isOpen) return;
        Promise.all([
            fetch(`${API_BASE}/roles`).then(r => r.json()),
            fetch(`${API_BASE}/especialidades`).then(r => r.json()),
        ]).then(([rolesData, espData]) => {
            setRoles(rolesData);
            setEspecialidades(espData);

            // Si estamos editando, rellenar campos
            if (editingUser) {
                setNombre(editingUser.nombre);
                setApellido(editingUser.apellido);
                setCorreo(editingUser.correo);
                setPassword('');
                const foundRol = rolesData.find((r: Role) => r.nombre === editingUser.rol);
                setRolId(foundRol ? foundRol.id : 0);
                const foundEsp = espData.find((e: Especialidad) => e.nombre === editingUser.especialidad);
                setEspecialidadId(foundEsp ? foundEsp.id : null);
            } else {
                // Limpiar formulario para crear
                setNombre('');
                setApellido('');
                setCorreo('');
                setPassword('');
                setRolId(0);
                setEspecialidadId(null);
            }
            setError('');
        }).catch(() => setError('No se pudieron cargar los catálogos'));
    }, [isOpen, editingUser]);

    // Determinar si el rol seleccionado es TECNICO
    const selectedRole = roles.find(r => r.id === rolId);
    const isTecnico = selectedRole?.nombre === 'TECNICO';

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');

        if (!nombre.trim() || !apellido.trim() || !correo.trim() || rolId === 0) {
            setError('Todos los campos obligatorios deben estar completos');
            return;
        }

        if (!isEditing && !password.trim()) {
            setError('La contraseña es obligatoria para nuevos usuarios');
            return;
        }

        setLoading(true);

        try {
            const url = isEditing
                ? `${API_BASE}/usuarios/${editingUser.id}`
                : `${API_BASE}/usuarios`;

            const body = isEditing
                ? { nombre, apellido, correo, rolId, especialidadId: isTecnico ? especialidadId : null }
                : { nombre, apellido, correo, password, rolId, especialidadId: isTecnico ? especialidadId : null };

            const response = await fetch(url, {
                method: isEditing ? 'PUT' : 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(body),
            });

            if (response.ok) {
                onSave();
                onClose();
            } else {
                const data = await response.json().catch(() => null);
                setError(data?.error || 'Error al guardar el usuario');
            }
        } catch {
            setError('No se pudo conectar al servidor');
        } finally {
            setLoading(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
            {/* Overlay */}
            <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />

            {/* Modal */}
            <div className="relative bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl w-full max-w-lg mx-4 overflow-hidden">
                {/* Header */}
                <div className="flex items-center justify-between px-6 py-4 border-b border-slate-700">
                    <h3 className="text-lg font-bold text-white">
                        {isEditing ? 'Editar usuario' : 'Nuevo usuario'}
                    </h3>
                    <button
                        onClick={onClose}
                        className="w-8 h-8 rounded-lg bg-slate-800 hover:bg-slate-700 flex items-center justify-center text-slate-400 hover:text-white transition-colors"
                    >
                        <FontAwesomeIcon icon={faXmark} />
                    </button>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} className="p-6 space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5">
                                Nombre *
                            </label>
                            <input
                                type="text"
                                value={nombre}
                                onChange={e => setNombre(e.target.value)}
                                className="w-full bg-slate-800 border border-slate-600 rounded-xl px-4 py-2.5 text-sm text-white placeholder:text-slate-500 focus:outline-none focus:border-yellow-500/50 transition-colors"
                                placeholder="Nombre"
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5">
                                Apellido *
                            </label>
                            <input
                                type="text"
                                value={apellido}
                                onChange={e => setApellido(e.target.value)}
                                className="w-full bg-slate-800 border border-slate-600 rounded-xl px-4 py-2.5 text-sm text-white placeholder:text-slate-500 focus:outline-none focus:border-yellow-500/50 transition-colors"
                                placeholder="Apellido"
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5">
                            Correo electrónico *
                        </label>
                        <input
                            type="email"
                            value={correo}
                            onChange={e => setCorreo(e.target.value)}
                            className="w-full bg-slate-800 border border-slate-600 rounded-xl px-4 py-2.5 text-sm text-white placeholder:text-slate-500 focus:outline-none focus:border-yellow-500/50 transition-colors"
                            placeholder="usuario@universidad.edu.pe"
                        />
                    </div>

                    {!isEditing && (
                        <div>
                            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5">
                                Contraseña *
                            </label>
                            <input
                                type="password"
                                value={password}
                                onChange={e => setPassword(e.target.value)}
                                className="w-full bg-slate-800 border border-slate-600 rounded-xl px-4 py-2.5 text-sm text-white placeholder:text-slate-500 focus:outline-none focus:border-yellow-500/50 transition-colors"
                                placeholder="Mínimo 6 caracteres"
                            />
                        </div>
                    )}

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5">
                                Rol *
                            </label>
                            <select
                                value={rolId}
                                onChange={e => {
                                    setRolId(Number(e.target.value));
                                    // Limpiar especialidad si cambia el rol
                                    if (roles.find(r => r.id === Number(e.target.value))?.nombre !== 'TECNICO') {
                                        setEspecialidadId(null);
                                    }
                                }}
                                className="w-full bg-slate-800 border border-slate-600 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-yellow-500/50 transition-colors"
                            >
                                <option value={0} disabled>Seleccionar rol</option>
                                {roles.map(r => (
                                    <option key={r.id} value={r.id}>{r.nombre}</option>
                                ))}
                            </select>
                        </div>

                        {isTecnico && (
                            <div>
                                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5">
                                    Especialidad
                                </label>
                                <select
                                    value={especialidadId ?? ''}
                                    onChange={e => setEspecialidadId(e.target.value ? Number(e.target.value) : null)}
                                    className="w-full bg-slate-800 border border-slate-600 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-yellow-500/50 transition-colors"
                                >
                                    <option value="">Sin especialidad</option>
                                    {especialidades.map(e => (
                                        <option key={e.id} value={e.id}>{e.nombre}</option>
                                    ))}
                                </select>
                            </div>
                        )}
                    </div>

                    {/* Error */}
                    {error && (
                        <div className="text-red-400 text-sm bg-red-950/40 border border-red-800/50 rounded-xl px-4 py-3">
                            {error}
                        </div>
                    )}

                    {/* Actions */}
                    <div className="flex items-center justify-end gap-3 pt-2">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-5 py-2.5 rounded-xl text-sm font-medium text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
                        >
                            Cancelar
                        </button>
                        <button
                            type="submit"
                            disabled={loading}
                            className="inline-flex items-center gap-2 px-6 py-2.5 bg-gradient-to-r from-yellow-400 to-orange-500 hover:from-yellow-500 hover:to-orange-600 text-slate-950 rounded-xl font-bold text-sm transition-all duration-200 hover:scale-[1.02] active:scale-[0.98] shadow-lg shadow-orange-500/10 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {loading ? (
                                <FontAwesomeIcon icon={faSpinner} spin />
                            ) : (
                                isEditing ? 'Guardar cambios' : 'Crear usuario'
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
