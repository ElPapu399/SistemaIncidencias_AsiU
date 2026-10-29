import { useEffect, useRef, useState } from 'react';
import type { FormEvent } from 'react';
import { X } from 'lucide-react';
import type { Laboratorio } from '../../types/laboratorio';
import { obtenerEncargadosLaboratorio } from '../../services/laboratoriosService';
import type { LaboratorioFormulario } from '../../services/laboratoriosService';

interface LaboratorioFormProps {
  laboratorio: Laboratorio | null;
  onSave: (datos: LaboratorioFormulario, id?: string) => Promise<void>;
  onClose: () => void;
}

export default function LaboratorioForm({ laboratorio, onSave, onClose }: LaboratorioFormProps) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const [encargados, setEncargados] = useState<{ id: number; nombre: string }[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const inputClass = 'w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:outline-2 focus:outline-blue-600';

  useEffect(() => {
    const dialog = dialogRef.current;
    dialog?.showModal();
    let ignore = false;
    obtenerEncargadosLaboratorio().then((data) => { if (!ignore) setEncargados(data); })
      .catch(() => { if (!ignore) setLoadError('No se pudo cargar la lista de encargados. Cierra el formulario e inténtalo nuevamente.'); })
      .finally(() => { if (!ignore) setLoading(false); });
    return () => { ignore = true; dialog?.close(); };
  }, []);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (saving || loading || loadError) return;
    const data = new FormData(event.currentTarget);
    const texto = (name: string) => String(data.get(name) ?? '').trim();
    if (!texto('nombre') || !texto('pabellon')) { setError('Completa el nombre y el pabellón.'); return; }
    const estado = texto('estado');
    if (estado && estado !== 'Operativo' && estado !== 'Mantenimiento') return;
    setSaving(true); setError('');
    try {
      await onSave({ nombre: texto('nombre'), pabellon: texto('pabellon'), piso: Number(texto('piso')),
        capacidad: texto('capacidad') ? Number(texto('capacidad')) : null,
        encargadoId: texto('encargadoId') ? Number(texto('encargadoId')) : null,
        estado: estado === 'Operativo' || estado === 'Mantenimiento' ? estado : null }, laboratorio?.id);
      onClose();
    } catch (err) { setError(err instanceof Error ? err.message : 'No se pudo guardar.'); setSaving(false); }
  }

  return (
    <dialog ref={dialogRef} onCancel={(event) => { if (saving) event.preventDefault(); else onClose(); }} aria-labelledby="laboratorio-form-title" className="m-auto max-h-[90dvh] w-[calc(100%-2rem)] max-w-xl overflow-y-auto rounded-2xl bg-white p-6 text-left text-slate-900 shadow-xl backdrop:bg-slate-950/50">
      <div className="mb-5 flex items-center justify-between gap-4"><h3 id="laboratorio-form-title" className="text-xl font-bold">{laboratorio ? 'Editar laboratorio' : 'Nuevo laboratorio'}</h3><button type="button" disabled={saving} onClick={onClose} aria-label="Cerrar formulario" className="cursor-pointer rounded-lg p-2 hover:bg-slate-100"><X className="h-5 w-5" /></button></div>
      {loading && <p role="status" className="mb-3 text-sm text-slate-500">Cargando encargados…</p>}
      {loadError && <p role="alert" className="mb-3 text-sm text-red-700">{loadError}</p>}
      <form onSubmit={handleSubmit}><fieldset disabled={saving || loading || Boolean(loadError)} className="space-y-4">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <label className="space-y-1 text-sm font-medium">Nombre<input name="nombre" required maxLength={50} defaultValue={laboratorio?.nombre ?? ''} className={inputClass} /></label>
          <label className="space-y-1 text-sm font-medium">Pabellón<input name="pabellon" required maxLength={50} defaultValue={laboratorio?.pabellon ?? ''} className={inputClass} /></label>
          <label className="space-y-1 text-sm font-medium">Piso<input name="piso" type="number" min={0} step={1} required defaultValue={laboratorio?.pisoNumero ?? 0} className={inputClass} /></label>
          <label className="space-y-1 text-sm font-medium">Capacidad (opcional)<input name="capacidad" type="number" min={1} step={1} defaultValue={laboratorio?.capacidad ?? ''} className={inputClass} /></label>
          <label className="space-y-1 text-sm font-medium">Encargado<select name="encargadoId" defaultValue={laboratorio?.encargadoId ?? ''} className={inputClass}><option value="">Sin registrar</option>{laboratorio?.encargadoId && !encargados.some((item) => item.id === laboratorio.encargadoId) && <option value={laboratorio.encargadoId}>{laboratorio.encargado} (no disponible)</option>}{encargados.map((item) => <option key={item.id} value={item.id}>{item.nombre}</option>)}</select></label>
          <label className="space-y-1 text-sm font-medium">Estado<select name="estado" defaultValue={laboratorio && laboratorio.estado !== 'Sin definir' ? laboratorio.estado : laboratorio ? '' : 'Operativo'} className={inputClass}><option value="">Sin definir</option><option value="Operativo">Operativo</option><option value="Mantenimiento">Mantenimiento</option></select></label>
        </div>
        <p className="text-xs text-slate-500">La cantidad de PCs y equipos se calcula desde el inventario registrado.</p>
        {error && <p role="alert" className="text-sm text-red-700">{error}</p>}
        <div className="flex justify-end gap-3"><button type="button" onClick={onClose} className="cursor-pointer rounded-xl border border-slate-300 px-4 py-2">Cancelar</button><button type="submit" className="cursor-pointer rounded-xl bg-blue-600 px-4 py-2 font-semibold text-white disabled:opacity-50">{saving ? 'Guardando…' : 'Guardar'}</button></div>
      </fieldset></form>
    </dialog>
  );
}
