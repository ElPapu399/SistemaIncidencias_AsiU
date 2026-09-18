import { useState, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
    faXmark,
    faSpinner,
    faGraduationCap,
    faScrewdriverWrench,
    faInfoCircle,
    faShieldHalved
} from '@fortawesome/free-solid-svg-icons';
import type { User, Role, Especialidad } from '../../types/user';
import { fetchWithAuth } from '../../utils/fetchWithAuth';

interface UserFormProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: () => void;
    editingUser: User | null;
    mode?: 'estudiante' | 'tecnico';
}

const INPUT_STYLE = "w-full bg-slate-800 border border-slate-600 rounded-xl px-4 py-2.5 text-sm text-white placeholder:text-slate-500 focus:outline-none focus:border-yellow-500/50 transition-colors";
const LABEL_STYLE = "block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5";

const ROLE_LABELS: Record<string, string> = {
    ADMIN: 'Administrador',
    ESTUDIANTE: 'Estudiante',
    TECNICO_GENERAL: 'Soporte General (Mesa de ayuda)',
    TECNICO_ESPECIALISTA: 'Soporte Especializado (Campo)',
};

export default function UserFormModal({ isOpen, onClose, onSave, editingUser, mode }: UserFormProps) {
    const [nombre, setNombre] = useState('');
    const [apellido, setApellido] = useState('');
    const [correo, setCorreo] = useState('');
    const [password, setPassword] = useState('');
    const [rolId, setRolId] = useState<number>(0);
    const [especialidadId, setEspecialidadId] = useState<number | null>(null);
    const [carrera, setCarrera] = useState('');
    const [telefono, setTelefono] = useState('');
    const [estado, setEstado] = useState('Activo');

    const [roles, setRoles] = useState<Role[]>([]);
    const [especialidades, setEspecialidades] = useState<Especialidad[]>([]);

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const isEditing = editingUser !== null;

    // Cargar catálogos y rellenar si estamos editando
    useEffect(() => {
        if (!isOpen) return;

        Promise.all([
            fetchWithAuth('/roles').then(r => r.json()),
            fetchWithAuth('/especialidades').then(r => r.json()),
        ]).then(([rolesData, espData]) => {
            const allRoles = rolesData as Role[];
            // Filtrar rol legacy 'TECNICO' y filtrar por modo si corresponde
            let cleanRoles = allRoles.filter((r: Role) => r.nombre !== 'TECNICO');

            if (mode === 'estudiante') {
                cleanRoles = cleanRoles.filter((r: Role) => r.nombre === 'ESTUDIANTE');
            } else if (mode === 'tecnico') {
                cleanRoles = cleanRoles.filter((r: Role) => r.nombre === 'TECNICO_GENERAL' || r.nombre === 'TECNICO_ESPECIALISTA');
            }

            setRoles(cleanRoles);
            setEspecialidades(espData);

            if (editingUser) {
                setNombre(editingUser.nombre);
                setApellido(editingUser.apellido);
                setCorreo(editingUser.correo);
                setPassword('');
                const effectiveRol = editingUser.rol === 'TECNICO' ? 'TECNICO_ESPECIALISTA' : editingUser.rol;
                const foundRol = cleanRoles.find((r: Role) => r.nombre === effectiveRol);
                setRolId(foundRol ? foundRol.id : 0);
                const foundEsp = espData.find((e: Especialidad) => e.nombre === editingUser.especialidad);
                setEspecialidadId(foundEsp ? foundEsp.id : null);
                setCarrera(editingUser.carrera || '');
                setTelefono(editingUser.telefono || '');
                setEstado(editingUser.estado || 'Activo');
            } else {
                setNombre('');
                setApellido('');
                setCorreo('');
                setPassword('');
                if (mode === 'estudiante') {
                    const estRol = cleanRoles.find(r => r.nombre === 'ESTUDIANTE');
                    setRolId(estRol ? estRol.id : 0);
                } else if (mode === 'tecnico') {
                    // Preseleccionar Técnico Especialista por defecto para mayor comodidad
                    const espRol = cleanRoles.find(r => r.nombre === 'TECNICO_ESPECIALISTA');
                    setRolId(espRol ? espRol.id : (cleanRoles[0]?.id || 0));
                } else {
                    setRolId(0);
                }
                setEspecialidadId(null);
                setCarrera('');
                setTelefono('');
                setEstado('Activo');
            }
            setError('');
        }).catch(() => setError('No se pudieron cargar los catálogos'));
    }, [isOpen, editingUser, mode]);

    // Determinar tipo de rol seleccionado
    const selectedRole = roles.find(r => r.id === rolId);
    const isTecnicoGeneral = selectedRole?.nombre === 'TECNICO_GENERAL';
    const isTecnicoEspecialista = selectedRole?.nombre === 'TECNICO_ESPECIALISTA';
    const isTecnicoLegacy = selectedRole?.nombre === 'TECNICO';
    const isTecnico = mode === 'tecnico' || isTecnicoGeneral || isTecnicoEspecialista || isTecnicoLegacy;
    const canHaveEspecialidad = isTecnicoEspecialista || isTecnicoLegacy;
    const isEstudiante = mode === 'estudiante' || selectedRole?.nombre === 'ESTUDIANTE';

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');

        let effectiveRolId = rolId;
        if (mode === 'estudiante' && (!effectiveRolId || effectiveRolId === 0)) {
            const estRol = roles.find(r => r.nombre === 'ESTUDIANTE');
            if (estRol) effectiveRolId = estRol.id;
        }

        if (!nombre.trim() || !apellido.trim() || !correo.trim() || !effectiveRolId || effectiveRolId === 0) {
            setError('Todos los campos obligatorios deben estar completos');
            return;
        }

        if (canHaveEspecialidad && (!especialidadId || especialidadId === 0)) {
            setError('Debe seleccionar una especialidad para el técnico especialista');
            return;
        }

        if (!isEditing && !password.trim()) {
            setError('La contraseña es obligatoria para nuevos usuarios');
            return;
        }

        setLoading(true);

        try {
            const url = isEditing ? `/usuarios/${editingUser.id}` : '/usuarios';

            const body = isEditing
                ? {
                    nombre, apellido, correo, rolId: effectiveRolId,
                    especialidadId: canHaveEspecialidad ? especialidadId : null,
                    carrera: isEstudiante ? carrera || null : null,
                    telefono: isTecnico ? telefono || null : null,
                    estado: isTecnico ? estado : null,
                }
                : {
                    nombre, apellido, correo, password, rolId: effectiveRolId,
                    especialidadId: canHaveEspecialidad ? especialidadId : null,
                    carrera: isEstudiante ? carrera || null : null,
                    telefono: isTecnico ? telefono || null : null,
                    estado: isTecnico ? estado : 'Activo',
                };

            const response = await fetchWithAuth(url, {
                method: isEditing ? 'PUT' : 'POST',
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

    const getModalTitle = () => {
        if (isEditing) {
            if (mode === 'estudiante' || editingUser.rol === 'ESTUDIANTE') return 'Editar estudiante';
            if (editingUser.rol === 'TECNICO_GENERAL') return 'Editar técnico de soporte general';
            if (editingUser.rol === 'TECNICO_ESPECIALISTA' || editingUser.rol === 'TECNICO') return 'Editar técnico especialista';
            return 'Editar técnico';
        }
        if (mode === 'estudiante') return 'Nuevo estudiante';
        if (mode === 'tecnico') return 'Nuevo técnico';
        return 'Nuevo usuario';
    };

    const getSubmitButtonLabel = () => {
        if (isEditing) return 'Guardar cambios';
        if (mode === 'estudiante') return 'Registrar estudiante';
        if (mode === 'tecnico') return 'Registrar técnico';
        return 'Crear usuario';
    };

    const getHeaderIcon = () => {
        if (mode === 'estudiante') return faGraduationCap;
        if (mode === 'tecnico') return faScrewdriverWrench;
        return faShieldHalved;
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
            {/* Overlay */}
            <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />

            {/* Modal */}
            <div className="relative bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl w-full max-w-lg mx-4 overflow-hidden">
                {/* Header */}
                <div className="flex items-center justify-between px-6 py-4 border-b border-slate-700 bg-slate-800/40">
                    <div className="flex items-center gap-3">
                        <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${
                            mode === 'estudiante'
                                ? 'bg-blue-500/10 text-blue-400 border border-blue-500/20'
                                : mode === 'tecnico'
                                ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                                : 'bg-slate-700 text-slate-300'
                        }`}>
                            <FontAwesomeIcon icon={getHeaderIcon()} />
                        </div>
                        <div>
                            <h3 className="text-lg font-bold text-white leading-tight">
                                {getModalTitle()}
                            </h3>
                            <p className="text-xs text-slate-400">
                                {mode === 'estudiante'
                                    ? 'Formulario de registro para alumnos'
                                    : mode === 'tecnico'
                                    ? 'Formulario de registro para el equipo de soporte TI'
                                    : 'Gestión de usuarios del sistema'}
                            </p>
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        className="w-8 h-8 rounded-lg bg-slate-800 hover:bg-slate-700 flex items-center justify-center text-slate-400 hover:text-white transition-colors cursor-pointer"
                    >
                        <FontAwesomeIcon icon={faXmark} />
                    </button>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} className="p-6 space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className={LABEL_STYLE}>Nombre *</label>
                            <input
                                type="text"
                                value={nombre}
                                onChange={e => setNombre(e.target.value)}
                                className={INPUT_STYLE}
                                placeholder="Nombre"
                            />
                        </div>
                        <div>
                            <label className={LABEL_STYLE}>Apellido *</label>
                            <input
                                type="text"
                                value={apellido}
                                onChange={e => setApellido(e.target.value)}
                                className={INPUT_STYLE}
                                placeholder="Apellido"
                            />
                        </div>
                    </div>

                    <div>
                        <label className={LABEL_STYLE}>Correo electrónico *</label>
                        <input
                            type="email"
                            value={correo}
                            onChange={e => setCorreo(e.target.value)}
                            className={INPUT_STYLE}
                            placeholder={
                                mode === 'estudiante'
                                    ? 'estudiante@universidad.edu.pe'
                                    : mode === 'tecnico'
                                    ? 'soporte@universidad.edu.pe'
                                    : 'usuario@universidad.edu.pe'
                            }
                        />
                    </div>

                    {!isEditing && (
                        <div>
                            <label className={LABEL_STYLE}>Contraseña *</label>
                            <input
                                type="password"
                                value={password}
                                onChange={e => setPassword(e.target.value)}
                                className={INPUT_STYLE}
                                placeholder="Mínimo 6 caracteres"
                            />
                        </div>
                    )}

                    {/* MODO ESTUDIANTE: Carrera universitaria */}
                    {mode === 'estudiante' && (
                        <div>
                            <label className={LABEL_STYLE}>Carrera universitaria</label>
                            <input
                                type="text"
                                value={carrera}
                                onChange={e => setCarrera(e.target.value)}
                                className={INPUT_STYLE}
                                placeholder="Ej: Ingeniería de Sistemas e Informática"
                            />
                        </div>
                    )}

                    {/* MODO TÉCNICO: Tipo de técnico y Especialidad */}
                    {mode === 'tecnico' && (
                        <div className="space-y-4">
                            <div className={canHaveEspecialidad ? "grid grid-cols-2 gap-4" : ""}>
                                <div>
                                    <label className={LABEL_STYLE}>Tipo de soporte *</label>
                                    <select
                                        value={rolId}
                                        onChange={e => {
                                            const nextRolId = Number(e.target.value);
                                            setRolId(nextRolId);
                                            const nextRoleName = roles.find(r => r.id === nextRolId)?.nombre;
                                            if (nextRoleName !== 'TECNICO_ESPECIALISTA' && nextRoleName !== 'TECNICO') {
                                                setEspecialidadId(null);
                                            }
                                        }}
                                        className={INPUT_STYLE}
                                    >
                                        <option value={0} disabled>Seleccionar tipo</option>
                                        {roles.map(r => (
                                            <option key={r.id} value={r.id}>
                                                {ROLE_LABELS[r.nombre] || r.nombre}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                {canHaveEspecialidad && (
                                    <div>
                                        <label className={LABEL_STYLE}>Especialidad *</label>
                                        <select
                                            value={especialidadId ?? ''}
                                            onChange={e => setEspecialidadId(e.target.value ? Number(e.target.value) : null)}
                                            className={INPUT_STYLE}
                                        >
                                            <option value="" disabled>Seleccionar especialidad</option>
                                            {especialidades.map(e => (
                                                <option key={e.id} value={e.id}>{e.nombre}</option>
                                            ))}
                                        </select>
                                    </div>
                                )}
                            </div>

                            {/* Info card de apoyo para entender el tipo de técnico */}
                            {isTecnicoGeneral && (
                                <div className="text-xs text-amber-300 bg-amber-950/30 border border-amber-800/40 rounded-xl p-3 flex items-start gap-2.5">
                                    <FontAwesomeIcon icon={faInfoCircle} className="mt-0.5 text-amber-400 shrink-0" />
                                    <span><strong>Soporte General:</strong> Mesa de ayuda y triaje inicial. Puede derivar y asignar incidencias a los especialistas.</span>
                                </div>
                            )}
                            {isTecnicoEspecialista && (
                                <div className="text-xs text-blue-300 bg-blue-950/30 border border-blue-800/40 rounded-xl p-3 flex items-start gap-2.5">
                                    <FontAwesomeIcon icon={faInfoCircle} className="mt-0.5 text-blue-400 shrink-0" />
                                    <span><strong>Soporte Especializado:</strong> Resuelve incidencias técnicas en campo según la especialidad seleccionada.</span>
                                </div>
                            )}

                            {/* Estado y Teléfono */}
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className={LABEL_STYLE}>Estado</label>
                                    <select
                                        value={estado}
                                        onChange={e => setEstado(e.target.value)}
                                        className={INPUT_STYLE}
                                    >
                                        <option value="Activo">Activo</option>
                                        <option value="Inactivo">Inactivo</option>
                                    </select>
                                </div>
                                <div>
                                    <label className={LABEL_STYLE}>Teléfono de contacto</label>
                                    <input
                                        type="text"
                                        value={telefono}
                                        onChange={e => setTelefono(e.target.value)}
                                        className={INPUT_STYLE}
                                        placeholder="Ej: 999 888 777"
                                    />
                                </div>
                            </div>
                        </div>
                    )}

                    {/* MODO GENÉRICO (si se usa sin mode) */}
                    {!mode && (
                        <>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className={LABEL_STYLE}>Rol *</label>
                                    <select
                                        value={rolId}
                                        onChange={e => {
                                            const nextRolId = Number(e.target.value);
                                            setRolId(nextRolId);
                                            const nextRoleName = roles.find(r => r.id === nextRolId)?.nombre;
                                            if (nextRoleName !== 'TECNICO_ESPECIALISTA' && nextRoleName !== 'TECNICO') {
                                                setEspecialidadId(null);
                                            }
                                        }}
                                        className={INPUT_STYLE}
                                    >
                                        <option value={0} disabled>Seleccionar rol</option>
                                        {roles.map(r => (
                                            <option key={r.id} value={r.id}>
                                                {ROLE_LABELS[r.nombre] || r.nombre}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                {canHaveEspecialidad && (
                                    <div>
                                        <label className={LABEL_STYLE}>Especialidad *</label>
                                        <select
                                            value={especialidadId ?? ''}
                                            onChange={e => setEspecialidadId(e.target.value ? Number(e.target.value) : null)}
                                            className={INPUT_STYLE}
                                        >
                                            <option value="" disabled>Seleccionar especialidad</option>
                                            {especialidades.map(e => (
                                                <option key={e.id} value={e.id}>{e.nombre}</option>
                                            ))}
                                        </select>
                                    </div>
                                )}
                            </div>

                            {isEstudiante && (
                                <div>
                                    <label className={LABEL_STYLE}>Carrera</label>
                                    <input
                                        type="text"
                                        value={carrera}
                                        onChange={e => setCarrera(e.target.value)}
                                        className={INPUT_STYLE}
                                        placeholder="Ej: Ingeniería de Sistemas"
                                    />
                                </div>
                            )}

                            {isTecnico && (
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className={LABEL_STYLE}>Estado</label>
                                        <select
                                            value={estado}
                                            onChange={e => setEstado(e.target.value)}
                                            className={INPUT_STYLE}
                                        >
                                            <option value="Activo">Activo</option>
                                            <option value="Inactivo">Inactivo</option>
                                        </select>
                                    </div>
                                    <div>
                                        <label className={LABEL_STYLE}>Teléfono</label>
                                        <input
                                            type="text"
                                            value={telefono}
                                            onChange={e => setTelefono(e.target.value)}
                                            className={INPUT_STYLE}
                                            placeholder="Ej: 999 888 777"
                                        />
                                    </div>
                                </div>
                            )}
                        </>
                    )}

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
                            className="px-5 py-2.5 rounded-xl text-sm font-medium text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
                        >
                            Cancelar
                        </button>
                        <button
                            type="submit"
                            disabled={loading}
                            className="inline-flex items-center gap-2 px-6 py-2.5 bg-gradient-to-r from-yellow-400 to-orange-500 hover:from-yellow-500 hover:to-orange-600 text-slate-950 rounded-xl font-bold text-sm transition-all duration-200 hover:scale-[1.02] active:scale-[0.98] shadow-lg shadow-orange-500/10 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                        >
                            {loading ? (
                                <FontAwesomeIcon icon={faSpinner} spin />
                            ) : (
                                getSubmitButtonLabel()
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
