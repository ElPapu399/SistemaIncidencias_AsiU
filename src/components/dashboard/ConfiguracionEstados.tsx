import Button from '../Button';
import { useEffect, useState } from 'react';
import { obtenerEstadosSistema } from '../../services/configuracionService';
import { TableSkeleton } from './SkeletonLoaders';

const estadoClases: Record<string, string> = {
  Pendiente: 'border-(--border-color) bg-(--surface-muted) text-(--text-secondary)',
  Asignada: 'border-(--tone-amber-border-200) bg-(--tone-amber-bg-50) text-(--tone-amber-text-700)',
  'En atención': 'border-(--tone-blue-border-200) bg-(--tone-blue-bg-50) text-(--tone-blue-text-700)',
  Resuelta: 'border-(--tone-emerald-border-200) bg-(--tone-emerald-bg-50) text-(--tone-emerald-text-700)',
  Cerrada: 'border-(--border-color) bg-(--surface-subtle) text-(--text-secondary)',
};

export default function ConfiguracionEstados() {
  const [estados, setEstados] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [intento, setIntento] = useState(0);

  useEffect(() => {
    let ignore = false;
    obtenerEstadosSistema()
      .then((data) => { if (!ignore) setEstados(data); })
      .catch((err: unknown) => { if (!ignore) setError(err instanceof Error ? err.message : 'No se pudieron cargar los estados.'); })
      .finally(() => { if (!ignore) setLoading(false); });
    return () => { ignore = true; };
  }, [intento]);

  return (
    <div className="space-y-5">
      <h3 className="text-lg font-bold text-(--text-primary)">Estados oficiales del sistema</h3>
      {loading ? <TableSkeleton rows={3} showFilters={false} /> : error ? (
        <div role="alert" className="space-y-3 rounded-xl border border-(--tone-red-border-200) bg-(--tone-red-bg-50) p-4 text-sm text-(--tone-red-text-700)">
          <p>{error}</p>
          <Button variant="neutral" appearance="text" size="custom" type="button" onClick={() => { setError(''); setLoading(true); setIntento((value) => value + 1); }} className="cursor-pointer font-semibold underline">Reintentar</Button>
        </div>
      ) : (
        <>
          <ul aria-label="Estados permitidos para las incidencias" className="flex flex-wrap gap-3">
            {estados.map((estado) => <li key={estado} className={`rounded-xl border px-4 py-2 text-sm font-semibold ${estadoClases[estado] ?? estadoClases.Cerrada}`}>{estado}</li>)}
          </ul>
          <p className="text-sm text-(--text-secondary)">Los estados del sistema no pueden modificarse desde esta página para mantener la integridad de los reportes históricos.</p>
        </>
      )}
    </div>
  );
}
