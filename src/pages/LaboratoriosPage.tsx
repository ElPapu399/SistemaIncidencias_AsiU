import { useEffect, useState } from 'react';
import { Plus } from 'lucide-react';
import Header from '../components/dashboard/Header';
import LaboratorioCard from '../components/dashboard/LaboratorioCard';
import LaboratorioForm from '../components/dashboard/LaboratorioForm';
import { obtenerLaboratorios, guardarLaboratorio } from '../services/laboratoriosService';
import type { LaboratorioFormulario } from '../services/laboratoriosService';
import type { Laboratorio } from '../types/laboratorio';
import { getCurrentUser } from '../utils/auth';

interface LaboratoriosPageProps { title: string; description: string; }

export default function LaboratoriosPage({ title, description }: LaboratoriosPageProps) {
  const [laboratorios, setLaboratorios] = useState<Laboratorio[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [intento, setIntento] = useState(0);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingLaboratorio, setEditingLaboratorio] = useState<Laboratorio | null>(null);
  const esAdmin = getCurrentUser()?.rol === 'ADMIN';

  useEffect(() => {
    let ignore = false;
    obtenerLaboratorios().then((data) => { if (!ignore) setLaboratorios(data); })
      .catch((err: unknown) => { if (!ignore) setError(err instanceof Error ? err.message : 'No se pudieron cargar los laboratorios.'); })
      .finally(() => { if (!ignore) setLoading(false); });
    return () => { ignore = true; };
  }, [intento]);

  async function guardar(datos: LaboratorioFormulario, id?: string) {
    const laboratorio = await guardarLaboratorio(datos, id);
    setLaboratorios((actuales) => id ? actuales.map((item) => item.id === id ? laboratorio : item) : [...actuales, laboratorio]);
  }

  return (
    <>
      <Header title={title} subtitle={description} />
      <main className="flex-1 space-y-8 bg-slate-100 p-6 lg:p-8">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="text-left">
            <h1 className="m-0! text-2xl! font-bold! tracking-normal! text-slate-900">Laboratorios</h1>
            <p className="mt-1 text-sm text-slate-500">{loading ? 'Cargando laboratorios…' : `${laboratorios.length} laboratorios registrados`}</p>
          </div>
          {esAdmin && <button type="button" onClick={() => { setEditingLaboratorio(null); setModalOpen(true); }} className="inline-flex cursor-pointer items-center justify-center gap-2 rounded-xl bg-blue-600 px-5 py-3 text-sm font-semibold text-white hover:bg-blue-700"><Plus className="h-5 w-5" aria-hidden="true" />Nuevo Laboratorio</button>}
        </div>
        {loading ? <p role="status" className="text-slate-500">Cargando…</p> : error ? (
          <div role="alert" className="space-y-3 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700"><p>{error}</p><button type="button" onClick={() => { setError(''); setLoading(true); setIntento((value) => value + 1); }} className="cursor-pointer underline">Reintentar</button></div>
        ) : laboratorios.length === 0 ? <p className="rounded-2xl bg-white p-10 text-center text-slate-500">Aún no hay laboratorios registrados.</p> : (
          <div className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3">
            {laboratorios.map((laboratorio) => <LaboratorioCard key={laboratorio.id} laboratorio={laboratorio} onEdit={esAdmin ? (item) => { setEditingLaboratorio(item); setModalOpen(true); } : undefined} />)}
          </div>
        )}
      </main>
      {modalOpen && <LaboratorioForm laboratorio={editingLaboratorio} onSave={guardar} onClose={() => setModalOpen(false)} />}
    </>
  );
}
