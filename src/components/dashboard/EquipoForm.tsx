import { useEffect, useRef, useState } from 'react';
import type { FormEvent } from 'react';
import { X } from 'lucide-react';
import { ESTADOS_EQUIPO } from '../../types/equipo';
import type { Equipo, EquipoEstadoFormulario, EquipoFormulario, EstadoEquipo } from '../../types/equipo';

interface EquipoFormProps {
  equipo: Equipo | null;
  modo: 'activo' | 'estado';
  laboratorioId: number;
  onSave: (datos: EquipoFormulario, id?: number) => Promise<void>;
  onChangeState: (id: number, datos: EquipoEstadoFormulario) => Promise<void>;
  onClose: () => void;
}

const campos = [
  { name: 'codigo', label: 'Código', required: true, max: 50 },
  { name: 'tipo', label: 'Tipo', required: true, max: 50 },
  { name: 'marca', label: 'Marca', required: false, max: 100 },
  { name: 'modelo', label: 'Modelo', required: false, max: 100 },
  { name: 'numeroSerie', label: 'Número de serie', required: false, max: 100 },
] as const;

export default function EquipoForm({ equipo, modo, laboratorioId, onSave, onChangeState, onClose }: EquipoFormProps) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const inputClass = 'w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:outline-2 focus:outline-blue-600';
  const [hoy] = useState(() => new Date(Date.now() - 5 * 3_600_000).toISOString().slice(0, 10));

  useEffect(() => {
    const dialog = dialogRef.current;
    dialog?.showModal();
    return () => dialog?.close();
  }, []);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (saving) return;
    const data = new FormData(event.currentTarget);
    const texto = (name: string) => String(data.get(name) ?? '').trim();
    if (modo === 'activo' && (!texto('codigo') || !texto('tipo'))) { setError('Completa el código y el tipo.'); return; }
    if (modo === 'estado' && (!texto('motivo') || !ESTADOS_EQUIPO.includes(texto('estado') as EstadoEquipo))) { setError('Selecciona un estado e indica el motivo.'); return; }
    setSaving(true); setError('');
    try {
      if (modo === 'estado' && equipo) {
        await onChangeState(equipo.id, { estado: texto('estado') as EstadoEquipo, motivo: texto('motivo') });
      } else {
        await onSave({ codigo: texto('codigo'), tipo: texto('tipo'), marca: texto('marca'), modelo: texto('modelo'),
          numeroSerie: texto('numeroSerie'), fechaAdquisicion: texto('fechaAdquisicion') || null, ubicacionId: laboratorioId }, equipo?.id);
      }
      onClose();
    } catch (err) { setError(err instanceof Error ? err.message : 'No se pudo guardar el equipo.'); setSaving(false); }
  }

  return (
    <dialog ref={dialogRef} onCancel={(event) => { if (saving) event.preventDefault(); else onClose(); }} aria-labelledby="equipo-form-title" className="m-auto max-h-[90dvh] w-[calc(100%-2rem)] max-w-xl overflow-y-auto rounded-2xl bg-white p-6 text-left text-slate-900 shadow-xl backdrop:bg-slate-950/50">
      <div className="mb-5 flex items-center justify-between gap-4">
        <h3 id="equipo-form-title" className="text-xl font-bold">{modo === 'estado' ? 'Cambiar estado' : equipo ? 'Editar activo' : 'Agregar equipo'}</h3>
        <button type="button" onClick={onClose} disabled={saving} aria-label="Cerrar formulario" className="cursor-pointer rounded-lg p-2 hover:bg-slate-100"><X className="h-5 w-5" /></button>
      </div>
      <form onSubmit={handleSubmit}><fieldset disabled={saving} className="space-y-4">
        {modo === 'estado' ? <>
          <p className="text-sm text-slate-500">{equipo?.codigo} · Estado actual: {equipo?.estado}</p>
          <label className="block space-y-1 text-sm font-medium">Nuevo estado<select name="estado" required defaultValue="" className={inputClass}><option value="" disabled>Selecciona un estado</option>{ESTADOS_EQUIPO.map((estado) => <option key={estado} value={estado} disabled={estado === equipo?.estado}>{estado}</option>)}</select></label>
          <label className="block space-y-1 text-sm font-medium">Motivo del cambio<textarea name="motivo" required maxLength={500} rows={3} className={inputClass} /></label>
          <p className="text-xs text-slate-500">El cambio quedará registrado con tu usuario y fecha. Dar de baja conserva el equipo y sus incidencias.</p>
        </> : <>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            {campos.map((campo) => <label key={campo.name} className="space-y-1 text-sm font-medium">{campo.label}{campo.required ? ' *' : ''}<input name={campo.name} required={campo.required} maxLength={campo.max} defaultValue={equipo?.[campo.name] ?? ''} list={campo.name === 'tipo' ? 'tipos-equipo' : undefined} className={inputClass} /></label>)}
            <label className="space-y-1 text-sm font-medium">Fecha de adquisición<input name="fechaAdquisicion" type="date" max={hoy} defaultValue={equipo?.fechaAdquisicion ?? ''} className={inputClass} /></label>
          </div>
          <datalist id="tipos-equipo">{['PC', 'Proyector', 'Monitor', 'Teclado', 'Mouse', 'Impresora', 'Switch', 'Router'].map((tipo) => <option key={tipo} value={tipo} />)}</datalist>
          <p className="text-xs text-slate-500">{equipo ? 'El laboratorio y el estado se conservan al editar el activo.' : 'El equipo se registrará en este laboratorio con estado Operativo.'}</p>
        </>}
        {error && <p role="alert" className="text-sm text-red-700">{error}</p>}
        <div className="flex justify-end gap-3 pt-2"><button type="button" onClick={onClose} className="cursor-pointer rounded-xl border border-slate-300 px-4 py-2">Cancelar</button><button type="submit" className="cursor-pointer rounded-xl bg-blue-600 px-4 py-2 font-semibold text-white disabled:opacity-50">{saving ? 'Guardando…' : 'Guardar'}</button></div>
      </fieldset></form>
    </dialog>
  );
}
