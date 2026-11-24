import Button from '../components/Button';
import { useRef, useState } from 'react';
import type { FormEvent, KeyboardEvent } from 'react';
import Header from '../components/dashboard/Header';
import ConfiguracionCategorias from '../components/dashboard/ConfiguracionCategorias';
import ConfiguracionEspecialidades from '../components/dashboard/ConfiguracionEspecialidades';

const tabs = [
    { id: 'general', label: 'General' },
    { id: 'categorias', label: 'Categorías' },
    { id: 'especialidades', label: 'Especialidades' },
] as const;

type TabId = typeof tabs[number]['id'];

export default function Configuracion() {
    const [activeTab, setActiveTab] = useState<TabId>('general');
    const tabRefs = useRef<(HTMLButtonElement | null)[]>([]);
    const [institucion, setInstitucion] = useState('Universidad Tecnológica del Perú');
    const [correoSoporte, setCorreoSoporte] = useState('soporte@utp.edu.pe');
    const [mensaje, setMensaje] = useState('');
    const [error, setError] = useState('');

    function cambiarTabConTeclado(event: KeyboardEvent<HTMLButtonElement>, index: number) {
        let nextIndex: number;
        if (event.key === 'ArrowRight') nextIndex = (index + 1) % tabs.length;
        else if (event.key === 'ArrowLeft') nextIndex = (index - 1 + tabs.length) % tabs.length;
        else if (event.key === 'Home') nextIndex = 0;
        else if (event.key === 'End') nextIndex = tabs.length - 1;
        else return;

        event.preventDefault();
        setActiveTab(tabs[nextIndex].id);
        tabRefs.current[nextIndex]?.focus();
    }

    function guardarConfiguracion(event: FormEvent<HTMLFormElement>) {
        event.preventDefault();
        if (!institucion.trim()) {
        setMensaje('');
        setError('Ingresa el nombre de la institución.');
        return;
        }
        // Guardado temporal en el estado de la página, pendiente de integración.
        setInstitucion(institucion.trim());
        setCorreoSoporte(correoSoporte.trim());
        setError('');
        setMensaje('Configuración actualizada temporalmente.');
    }

    return (
        <>
        <Header title="Configuración" subtitle="Ajustes del sistema." />
        <main className="flex-1 space-y-8 bg-(--app-bg) p-6 text-left lg:p-8">
            <div>
            <h1 className="m-0! text-2xl! font-bold! tracking-normal! text-(--text-primary)">Configuración del sistema</h1>
            <p className="mt-1 text-(--text-secondary)">Administra los parámetros generales de ASIU</p>
            </div>

            <section aria-label="Parámetros del sistema" className="w-full max-w-6xl rounded-2xl border border-(--border-color) bg-(--surface)">
            <div role="tablist" aria-label="Secciones de configuración" className="flex overflow-x-auto border-b border-(--border-color)">
                {tabs.map((tab, index) => (
                <button
                    key={tab.id}
                    ref={(element) => { tabRefs.current[index] = element; }}
                    type="button"
                    role="tab"
                    id={`config-tab-${tab.id}`}
                    aria-controls={`config-panel-${tab.id}`}
                    aria-selected={activeTab === tab.id}
                    tabIndex={activeTab === tab.id ? 0 : -1}
                    onClick={() => setActiveTab(tab.id)}
                    onKeyDown={(event) => cambiarTabConTeclado(event, index)}
                    className={`shrink-0 cursor-pointer border-b-2 px-5 py-4 text-sm font-semibold transition-colors first:rounded-tl-2xl focus-visible:outline-2 focus-visible:-outline-offset-4 focus-visible:outline-blue-600 sm:px-6 ${activeTab === tab.id ? 'border-blue-600 text-(--tone-blue-text-600)' : 'border-transparent text-(--text-secondary) hover:bg-(--surface-subtle) hover:text-(--text-primary)'}`}
                >
                    {tab.label}
                </button>
                ))}
            </div>

            <div id="config-panel-general" role="tabpanel" aria-labelledby="config-tab-general" hidden={activeTab !== 'general'} tabIndex={0} className="p-5 focus-visible:outline-2 focus-visible:-outline-offset-4 focus-visible:outline-blue-600 sm:p-7">
                <form onSubmit={guardarConfiguracion} className="space-y-5">
                <div>
                    <label htmlFor="config-institucion" className="mb-2 block text-base font-semibold text-(--text-primary)">Nombre de la institución</label>
                    <input
                    id="config-institucion"
                    name="institucion"
                    type="text"
                    required
                    value={institucion}
                    aria-invalid={Boolean(error)}
                    aria-describedby={error ? 'config-error' : undefined}
                    onChange={(event) => { setInstitucion(event.target.value); setMensaje(''); setError(''); }}
                    className="w-full rounded-xl border border-(--border-color) bg-(--surface-subtle) px-4 py-3 text-(--text-primary) focus:outline-2 focus:outline-blue-600"
                    />
                </div>
                <div>
                    <label htmlFor="config-correo" className="mb-2 block text-base font-semibold text-(--text-primary)">Correo de soporte</label>
                    <input
                    id="config-correo"
                    name="correoSoporte"
                    type="email"
                    required
                    value={correoSoporte}
                    onChange={(event) => { setCorreoSoporte(event.target.value); setMensaje(''); }}
                    className="w-full rounded-xl border border-(--border-color) bg-(--surface-subtle) px-4 py-3 text-(--text-primary) focus:outline-2 focus:outline-blue-600"
                    />
                </div>
                <div className="space-y-3 pt-2">
                    <Button variant="info" appearance="solid" size="custom" type="submit" className="w-full cursor-pointer rounded-xl px-5 py-3 text-sm font-semibold transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 sm:w-auto">Guardar configuración</Button>
                    <p className="text-xs text-(--text-secondary)">Los cambios se perderán al salir o recargar esta página.</p>
                    <p role="status" className="text-sm text-(--tone-emerald-text-700)">{mensaje}</p>
                    {error && <p id="config-error" role="alert" className="text-sm text-(--tone-red-text-600)">{error}</p>}
                </div>
                </form>
            </div>

            {tabs.filter((tab) => tab.id !== 'general').map((tab) => (
                <div key={tab.id} id={`config-panel-${tab.id}`} role="tabpanel" aria-labelledby={`config-tab-${tab.id}`} hidden={activeTab !== tab.id} tabIndex={0} className="p-5 focus-visible:outline-2 focus-visible:-outline-offset-4 focus-visible:outline-blue-600 sm:p-7">
                {activeTab === tab.id && (
                    tab.id === 'categorias' ? <ConfiguracionCategorias />
                    : <ConfiguracionEspecialidades />
                )}
                </div>
            ))}
            </section>
        </main>
        </>
    );
}
