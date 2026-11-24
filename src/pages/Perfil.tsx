import Button from '../components/Button';
import { useEffect, useState } from 'react';
import type { FormEvent } from 'react';
import { LockKeyhole } from 'lucide-react';
import Header from '../components/dashboard/Header';
import { guardarMiPerfil, obtenerMiPerfil } from '../services/perfilService';
import type { PerfilFormulario, PerfilUsuario } from '../services/perfilService';

const roles: Record<string, string> = {
    ADMIN: 'Administrador',
    ESTUDIANTE: 'Estudiante',
    TECNICO: 'Técnico',
    TECNICO_GENERAL: 'Técnico general',
    TECNICO_ESPECIALISTA: 'Técnico especialista',
};

const inputClass = 'w-full rounded-xl border border-(--border-color) bg-(--surface-subtle) px-4 py-3 text-(--text-primary) focus:outline-2 focus:outline-blue-600';

export default function Perfil() {
    const [perfil, setPerfil] = useState<PerfilUsuario | null>(null);
    const [formulario, setFormulario] = useState<PerfilFormulario>({ nombre: '', apellido: '', telefono: '', carrera: '' });
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [loadError, setLoadError] = useState('');
    const [error, setError] = useState('');
    const [mensaje, setMensaje] = useState('');
    const [intento, setIntento] = useState(0);

    useEffect(() => {
        let ignore = false;
        obtenerMiPerfil()
        .then((datos) => {
            if (ignore) return;
            setPerfil(datos);
            setFormulario({ nombre: datos.nombre, apellido: datos.apellido, telefono: datos.telefono ?? '', carrera: datos.carrera ?? '' });
        })
        .catch((err: unknown) => { if (!ignore) setLoadError(err instanceof Error ? err.message : 'No se pudo cargar tu perfil.'); })
        .finally(() => { if (!ignore) setLoading(false); });
        return () => { ignore = true; };
    }, [intento]);

    function cambiarCampo(campo: keyof PerfilFormulario, valor: string) {
        setFormulario((actual) => ({ ...actual, [campo]: valor }));
        setMensaje('');
        setError('');
    }

    async function guardarCambios(event: FormEvent<HTMLFormElement>) {
        event.preventDefault();
        if (saving) return;
        if (!formulario.nombre.trim() || !formulario.apellido.trim()) {
        setError('Completa los nombres y apellidos sin usar solo espacios.');
        setMensaje('');
        return;
        }
        setSaving(true);
        setError('');
        setMensaje('');
        try {
        const datos = await guardarMiPerfil({
            nombre: formulario.nombre.trim(), apellido: formulario.apellido.trim(),
            telefono: formulario.telefono.trim(), carrera: formulario.carrera.trim(),
        });
        setPerfil(datos);
        setFormulario({ nombre: datos.nombre, apellido: datos.apellido, telefono: datos.telefono ?? '', carrera: datos.carrera ?? '' });
        setMensaje('Tu perfil se actualizó correctamente.');
        } catch (err) {
        setError(err instanceof Error ? err.message : 'No se pudieron guardar los cambios.');
        } finally {
        setSaving(false);
        }
    }

    const esEstudiante = perfil?.rol === 'ESTUDIANTE';
    const esTecnico = perfil?.rol.startsWith('TECNICO');
    const nombreCompleto = perfil ? `${perfil.nombre} ${perfil.apellido}`.trim() : '';
    const iniciales = perfil ? `${perfil.nombre.trim().charAt(0)}${perfil.apellido.trim().charAt(0)}`.toLocaleUpperCase('es') : '';

    return (
        <>
        <Header title="Mi perfil" subtitle="Información personal de tu cuenta." nombreUsuario={perfil?.nombre} />
        <main className="flex-1 space-y-8 bg-(--app-bg) p-6 text-left lg:p-8">
            <div>
            <h1 className="m-0! text-2xl! font-bold! tracking-normal! text-(--text-primary)">Mi perfil</h1>
            <p className="mt-1 text-(--text-secondary)">Gestiona tu información personal</p>
            </div>
            <section aria-label="Información del perfil" className="w-full max-w-3xl rounded-2xl border border-(--border-color) bg-(--surface) p-6 sm:p-8">
            {loading ? <p role="status" className="text-sm text-(--text-secondary)">Cargando tu perfil…</p> : loadError ? (
                <div role="alert" className="space-y-3 text-sm text-(--tone-red-text-700)">
                <p>{loadError}</p>
                <Button variant="neutral" appearance="text" size="custom" type="button" onClick={() => { setLoadError(''); setLoading(true); setIntento((actual) => actual + 1); }} className="cursor-pointer font-semibold underline">Reintentar</Button>
                </div>
            ) : perfil && (
                <>
                <div className="mb-7 flex flex-col gap-5 border-b border-(--border-color) pb-7 sm:flex-row sm:items-center">
                    <div aria-hidden="true" className="flex h-20 w-20 shrink-0 items-center justify-center rounded-3xl bg-blue-950 text-3xl font-bold text-white">{iniciales}</div>
                    <div className="min-w-0">
                    <h3 className="wrap-anywhere text-xl font-bold text-(--text-primary)">{nombreCompleto}</h3>
                    {(esEstudiante || esTecnico) && <p className="mt-1 wrap-anywhere text-(--text-secondary)">{esEstudiante ? perfil.carrera || 'Sin carrera registrada' : perfil.especialidad || 'Sin especialidad asignada'}</p>}
                    <span className="mt-2 inline-flex rounded border border-(--tone-blue-border-200) bg-(--tone-blue-bg-50) px-2 py-0.5 text-sm font-semibold text-(--tone-blue-text-700)">{roles[perfil.rol] ?? perfil.rol}</span>
                    </div>
                </div>

                <form onSubmit={guardarCambios}>
                    <fieldset disabled={saving} className="space-y-5">
                    <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                        <label className="block space-y-2 font-semibold text-(--text-primary)">
                        <span className="block">Nombres</span>
                        <input name="nombre" type="text" autoComplete="given-name" required maxLength={100} value={formulario.nombre} onChange={(event) => cambiarCampo('nombre', event.target.value)} className={inputClass} />
                        </label>
                        <label className="block space-y-2 font-semibold text-(--text-primary)">
                        <span className="block">Apellidos</span>
                        <input name="apellido" type="text" autoComplete="family-name" required maxLength={100} value={formulario.apellido} onChange={(event) => cambiarCampo('apellido', event.target.value)} className={inputClass} />
                        </label>
                    </div>
                    <label className="block space-y-2 font-semibold text-(--text-primary)">
                        <span className="flex flex-wrap items-center gap-2">
                            Correo institucional
                            <span className="rounded border border-(--border-color) bg-(--surface-muted) px-2 py-0.5 text-xs font-medium text-(--text-secondary)">No editable</span>
                        </span>
                        <span className="relative block">
                            <input name="correo" type="email" autoComplete="email" readOnly value={perfil.correo}
                                aria-describedby="correo-perfil-restriccion"
                                className="w-full cursor-not-allowed rounded-xl border border-dashed border-(--border-color) bg-(--surface-muted) py-3 pr-12 pl-4 text-(--text-secondary) focus:outline-2 focus:outline-slate-400" />
                            <LockKeyhole className="pointer-events-none absolute top-1/2 right-4 h-4 w-4 -translate-y-1/2 text-(--text-secondary)" aria-hidden="true" />
                        </span>
                        <span id="correo-perfil-restriccion" className="block text-xs font-normal text-(--text-secondary)">El correo institucional no se puede modificar desde el perfil.</span>
                    </label>
                    <div className={`grid grid-cols-1 gap-5 ${esEstudiante || esTecnico ? 'sm:grid-cols-2' : ''}`}>
                        <label className="block space-y-2 font-semibold text-(--text-primary)">
                        <span className="block">Teléfono</span>
                        <input name="telefono" type="tel" autoComplete="tel" maxLength={20} value={formulario.telefono} onChange={(event) => cambiarCampo('telefono', event.target.value)} className={inputClass} />
                        </label>
                        {esEstudiante && <label className="block space-y-2 font-semibold text-(--text-primary)">
                        <span className="block">Carrera</span>
                        <input name="carrera" type="text" maxLength={100} value={formulario.carrera} onChange={(event) => cambiarCampo('carrera', event.target.value)} className={inputClass} />
                        </label>}
                        {esTecnico && <label className="block space-y-2 font-semibold text-(--text-primary)">
                        <span className="block">Especialidad</span>
                        <input name="especialidad" type="text" readOnly value={perfil.especialidad ?? ''} placeholder="Sin especialidad asignada" className={`${inputClass} text-(--text-secondary)`} />
                        </label>}
                    </div>
                    <div className="space-y-3 pt-2">
                        <Button variant="info" appearance="solid" size="custom" type="submit" disabled={saving} className="w-full cursor-pointer rounded-xl px-5 py-3 text-sm font-semibold transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 disabled:cursor-wait disabled:opacity-60 sm:w-auto">{saving ? 'Guardando…' : 'Guardar cambios'}</Button>
                        <p role="status" className="text-sm text-(--tone-emerald-text-700)">{mensaje}</p>
                        {error && <p role="alert" className="text-sm text-(--tone-red-text-700)">{error}</p>}
                    </div>
                    </fieldset>
                </form>
                </>
            )}
            </section>
        </main>
        </>
    );
}
