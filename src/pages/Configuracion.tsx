import { useRef, useState } from 'react';
import type { FormEvent, KeyboardEvent } from 'react';
import Header from '../components/dashboard/Header';
import ConfiguracionCategorias from '../components/dashboard/ConfiguracionCategorias';
import ConfiguracionEstados from '../components/dashboard/ConfiguracionEstados';
import ConfiguracionEspecialidades from '../components/dashboard/ConfiguracionEspecialidades';

const tabs = [
    { id: 'general', label: 'General' },
    { id: 'categorias', label: 'Categorías' },
    { id: 'especialidades', label: 'Especialidades' },
    { id: 'estados', label: 'Estados' },
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
        <main className="flex-1 space-y-8 bg-slate-100 p-6 text-left lg:p-8">
            <div>
            <h1 className="m-0! text-2xl! font-bold! tracking-normal! text-slate-900">Configuración del sistema</h1>
            <p className="mt-1 text-slate-500">Administra los parámetros generales de ASIU</p>
            </div>

            <section aria-label="Parámetros del sistema" className="w-full max-w-6xl rounded-2xl border border-slate-200 bg-white">
            <div role="tablist" aria-label="Secciones de configuración" className="flex overflow-x-auto border-b border-slate-200">
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
                    className={`shrink-0 cursor-pointer border-b-2 px-5 py-4 text-sm font-semibold transition-colors first:rounded-tl-2xl focus-visible:outline-2 focus-visible:-outline-offset-4 focus-visible:outline-blue-600 sm:px-6 ${activeTab === tab.id ? 'border-blue-600 text-blue-600' : 'border-transparent text-slate-500 hover:bg-slate-50 hover:text-slate-700'}`}
                >
                    {tab.label}
                </button>
                ))}
            </div>

            <div id="config-panel-general" role="tabpanel" aria-labelledby="config-tab-general" hidden={activeTab !== 'general'} tabIndex={0} className="p-5 focus-visible:outline-2 focus-visible:-outline-offset-4 focus-visible:outline-blue-600 sm:p-7">
                <form onSubmit={guardarConfiguracion} className="space-y-5">
                <div>
                    <label htmlFor="config-institucion" className="mb-2 block text-base font-semibold text-slate-900">Nombre de la institución</label>
                    <input
                    id="config-institucion"
                    name="institucion"
                    type="text"
                    required
                    value={institucion}
                    aria-invalid={Boolean(error)}
                    aria-describedby={error ? 'config-error' : undefined}
                    onChange={(event) => { setInstitucion(event.target.value); setMensaje(''); setError(''); }}
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-900 focus:outline-2 focus:outline-blue-600"
                    />
                </div>
                <div>
                    <label htmlFor="config-correo" className="mb-2 block text-base font-semibold text-slate-900">Correo de soporte</label>
                    <input
                    id="config-correo"
                    name="correoSoporte"
                    type="email"
                    required
                    value={correoSoporte}
                    onChange={(event) => { setCorreoSoporte(event.target.value); setMensaje(''); }}
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-900 focus:outline-2 focus:outline-blue-600"
                    />
                </div>
                <div className="space-y-3 pt-2">
                    <button type="submit" className="w-full cursor-pointer rounded-xl bg-blue-600 px-5 py-3 text-sm font-semibold text-white transition-colors hover:bg-blue-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600 sm:w-auto">Guardar configuración</button>
                    <p className="text-xs text-slate-500">Los cambios se perderán al salir o recargar esta página.</p>
                    <p role="status" className="text-sm text-emerald-700">{mensaje}</p>
                    {error && <p id="config-error" role="alert" className="text-sm text-red-600">{error}</p>}
                </div>
                </form>
            </div>

            {tabs.filter((tab) => tab.id !== 'general').map((tab) => (
                <div key={tab.id} id={`config-panel-${tab.id}`} role="tabpanel" aria-labelledby={`config-tab-${tab.id}`} hidden={activeTab !== tab.id} tabIndex={0} className="p-5 focus-visible:outline-2 focus-visible:-outline-offset-4 focus-visible:outline-blue-600 sm:p-7">
                {activeTab === tab.id && (
                    tab.id === 'categorias' ? <ConfiguracionCategorias />
                    : tab.id === 'especialidades' ? <ConfiguracionEspecialidades />
                    : <ConfiguracionEstados />
                )}
                </div>
            ))}
            </section>
        </main>
        </>
    );
}
