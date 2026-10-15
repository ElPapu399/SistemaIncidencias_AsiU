import { useEffect, useState } from 'react';
import { obtenerEstadosSistema } from '../../services/configuracionService';

const estadoClases: Record<string, string> = {
  Pendiente: 'border-slate-200 bg-slate-100 text-slate-600',
  Asignada: 'border-amber-200 bg-amber-50 text-amber-700',
  'En atención': 'border-blue-200 bg-blue-50 text-blue-700',
  Resuelta: 'border-emerald-200 bg-emerald-50 text-emerald-700',
  Cerrada: 'border-slate-200 bg-slate-50 text-slate-500',
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
      <h3 className="text-lg font-bold text-slate-900">Estados oficiales del sistema</h3>
      {loading ? <p role="status" className="text-sm text-slate-500">Cargando estados…</p> : error ? (
        <div role="alert" className="space-y-3 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          <p>{error}</p>
          <button type="button" onClick={() => { setError(''); setLoading(true); setIntento((value) => value + 1); }} className="cursor-pointer font-semibold underline">Reintentar</button>
        </div>
      ) : (
        <>
          <ul aria-label="Estados permitidos para las incidencias" className="flex flex-wrap gap-3">
            {estados.map((estado) => <li key={estado} className={`rounded-xl border px-4 py-2 text-sm font-semibold ${estadoClases[estado] ?? estadoClases.Cerrada}`}>{estado}</li>)}
          </ul>
          <p className="text-sm text-slate-500">Los estados del sistema no pueden modificarse desde esta página para mantener la integridad de los reportes históricos.</p>
        </>
      )}
    </div>
  );
}
