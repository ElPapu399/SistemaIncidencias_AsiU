import Button from '../components/Button';
import { useEffect, useState } from 'react';
import { Plus } from 'lucide-react';
import Header from '../components/dashboard/Header';
import LaboratorioCard from '../components/dashboard/LaboratorioCard';
import LaboratorioForm from '../components/dashboard/LaboratorioForm';
import EliminarLaboratorioModal from '../components/dashboard/EliminarLaboratorioModal';
import { CardsGridSkeleton } from '../components/dashboard/SkeletonLoaders';
import { obtenerLaboratorios, guardarLaboratorio, eliminarLaboratorio } from '../services/laboratoriosService';
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
  const [laboratorioEliminar, setLaboratorioEliminar] = useState<Laboratorio | null>(null);
  const [mensaje, setMensaje] = useState('');
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

  async function eliminar(id: string) {
    await eliminarLaboratorio(id);
    setLaboratorios((actuales) => actuales.filter((item) => item.id !== id));
    setMensaje('Laboratorio eliminado correctamente.');
  }

  return (
    <>
      <Header title={title} subtitle={description} />
      <main className="flex-1 space-y-8 bg-(--app-bg) p-6 lg:p-8">
        <div className="flex items-start justify-between gap-3 sm:items-center sm:gap-4">
          <div className="min-w-0 flex-1 text-left">
            <h1 className="m-0! text-2xl! font-bold! tracking-normal! text-(--text-primary)">Laboratorios</h1>
            <p className="mt-1 text-sm text-(--text-secondary)">{loading ? 'Cargando laboratorios…' : `${laboratorios.length} laboratorios registrados`}</p>
          </div>
          {esAdmin && (
            <Button
              variant="create"
              appearance="solid"
              size="custom"
              type="button"
              onClick={() => { setEditingLaboratorio(null); setModalOpen(true); }}
              aria-label="Nuevo laboratorio"
              title="Nuevo laboratorio"
              className="inline-flex h-10 w-10 shrink-0 cursor-pointer items-center justify-center gap-2 rounded-xl p-0 text-sm font-semibold sm:h-auto sm:w-auto sm:px-5 sm:py-3"
            >
              <Plus className="h-4 w-4 shrink-0 sm:h-5 sm:w-5" aria-hidden="true" />
              <span className="hidden sm:inline">Nuevo Laboratorio</span>
            </Button>
          )}
        </div>
        {mensaje && <p role="status" className="rounded-xl border border-(--tone-emerald-border-200) bg-(--tone-emerald-bg-50) p-3 text-sm text-(--tone-emerald-text-800)">{mensaje}</p>}
        {loading ? <CardsGridSkeleton count={6} /> : error ? (
          <div role="alert" className="space-y-3 rounded-xl border border-(--tone-red-border-200) bg-(--tone-red-bg-50) p-4 text-sm text-(--tone-red-text-700)"><p>{error}</p><Button variant="neutral" appearance="text" size="custom" type="button" onClick={() => { setError(''); setLoading(true); setIntento((value) => value + 1); }} className="cursor-pointer underline">Reintentar</Button></div>
        ) : laboratorios.length === 0 ? <p className="rounded-2xl bg-(--surface) p-10 text-center text-(--text-secondary)">Aún no hay laboratorios registrados.</p> : (
          <div className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3">
            {laboratorios.map((laboratorio) => <LaboratorioCard key={laboratorio.id} laboratorio={laboratorio} onEdit={esAdmin ? (item) => { setEditingLaboratorio(item); setModalOpen(true); } : undefined} onDelete={esAdmin ? (item) => { setMensaje(''); setLaboratorioEliminar(item); } : undefined} />)}
          </div>
        )}
      </main>
      {modalOpen && <LaboratorioForm laboratorio={editingLaboratorio} onSave={guardar} onClose={() => setModalOpen(false)} />}
      {laboratorioEliminar && <EliminarLaboratorioModal laboratorio={laboratorioEliminar} onDelete={eliminar} onClose={() => setLaboratorioEliminar(null)} />}
    </>
  );
}
