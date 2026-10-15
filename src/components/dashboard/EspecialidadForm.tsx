import { useEffect, useRef, useState } from 'react';
import type { FormEvent } from 'react';
import { X } from 'lucide-react';
import type { EspecialidadCatalogo, EspecialidadFormulario } from '../../services/configuracionService';

interface EspecialidadFormProps {
  especialidad: EspecialidadCatalogo | null;
  onSave: (datos: EspecialidadFormulario, id?: number) => Promise<void>;
  onClose: () => void;
}

export default function EspecialidadForm({ especialidad, onSave, onClose }: EspecialidadFormProps) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const inputClass = 'w-full rounded-xl border border-slate-300 bg-slate-50 px-3 py-2 text-sm focus:outline-2 focus:outline-blue-600';

  useEffect(() => {
    const dialog = dialogRef.current;
    dialog?.showModal();
    return () => dialog?.close();
  }, []);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (saving) return;
    const data = new FormData(event.currentTarget);
    const nombre = String(data.get('nombre') ?? '').trim();
    if (!nombre) {
      setError('Ingresa el nombre de la especialidad.');
      return;
    }
    setSaving(true);
    setError('');
    try {
      await onSave({ nombre, descripcion: String(data.get('descripcion') ?? '').trim() }, especialidad?.id);
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No se pudo guardar la especialidad.');
      setSaving(false);
    }
  }

  return (
    <dialog ref={dialogRef} aria-labelledby="especialidad-form-title" onCancel={(event) => { if (saving) event.preventDefault(); else onClose(); }} className="m-auto max-h-[90dvh] w-[calc(100%-2rem)] max-w-lg overflow-y-auto rounded-2xl bg-white p-6 text-left text-slate-900 shadow-xl backdrop:bg-slate-950/50">
      <div className="mb-5 flex items-center justify-between gap-4">
        <h3 id="especialidad-form-title" className="text-lg font-bold">{especialidad ? 'Editar especialidad' : 'Nueva especialidad'}</h3>
        <button type="button" onClick={onClose} disabled={saving} aria-label="Cerrar formulario" className="cursor-pointer rounded-lg p-2 hover:bg-slate-100 disabled:opacity-50"><X className="h-5 w-5" aria-hidden="true" /></button>
      </div>
      <form onSubmit={handleSubmit}>
        <fieldset disabled={saving} className="space-y-4">
          <label className="block space-y-2 text-sm font-semibold">
            <span className="block">Nombre</span>
            <input name="nombre" type="text" required maxLength={50} defaultValue={especialidad?.nombre ?? ''} className={inputClass} />
          </label>
          <label className="block space-y-2 text-sm font-semibold">
            <span className="block">Descripción (opcional)</span>
            <textarea name="descripcion" rows={3} maxLength={200} defaultValue={especialidad?.descripcion ?? ''} className={`${inputClass} resize-y`} />
          </label>
          {error && <p role="alert" className="text-sm text-red-700">{error}</p>}
          <div className="flex justify-end gap-3 pt-2">
            <button type="button" onClick={onClose} className="cursor-pointer rounded-xl border border-slate-300 px-4 py-2 text-sm hover:bg-slate-50">Cancelar</button>
            <button type="submit" className="cursor-pointer rounded-xl bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700 disabled:opacity-50">{saving ? 'Guardando…' : 'Guardar especialidad'}</button>
          </div>
        </fieldset>
      </form>
    </dialog>
  );
}
