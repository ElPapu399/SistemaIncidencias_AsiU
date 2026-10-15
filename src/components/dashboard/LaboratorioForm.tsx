import { useEffect, useRef, useState } from 'react';
import type { FormEvent } from 'react';
import { X } from 'lucide-react';
import type { Laboratorio } from '../../types/laboratorio';

interface LaboratorioFormProps {
  laboratorio: Laboratorio | null;
  onSave: (laboratorio: Laboratorio) => void;
  onClose: () => void;
}

const campos = [
  { name: 'nombre', label: 'Nombre', type: 'text' },
  { name: 'pabellon', label: 'Pabellón', type: 'text' },
  { name: 'piso', label: 'Piso', type: 'text' },
  { name: 'encargado', label: 'Encargado', type: 'text' },
  { name: 'capacidad', label: 'Capacidad', type: 'number', min: 1 },
  { name: 'cantidadPCs', label: 'Cantidad de PCs', type: 'number', min: 0 },
  { name: 'cantidadEquipos', label: 'Cantidad de equipos', type: 'number', min: 0 },
] as const;

export default function LaboratorioForm({ laboratorio, onSave, onClose }: LaboratorioFormProps) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const [error, setError] = useState('');

  useEffect(() => {
    const dialog = dialogRef.current;
    dialog?.showModal();
    return () => dialog?.close();
  }, []);

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    const texto = (name: string) => String(data.get(name) ?? '').trim();
    if (campos.some((campo) => campo.type === 'text' && !texto(campo.name))) {
      setError('Completa los campos de texto sin usar solo espacios.');
      return;
    }
    const estado = texto('estado');
    if (estado !== 'Operativo' && estado !== 'Mantenimiento') return;

    onSave({
      id: laboratorio?.id ?? crypto.randomUUID(),
      nombre: texto('nombre'),
      pabellon: texto('pabellon'),
      piso: texto('piso'),
      encargado: texto('encargado'),
      capacidad: Number(data.get('capacidad')),
      cantidadPCs: Number(data.get('cantidadPCs')),
      cantidadEquipos: Number(data.get('cantidadEquipos')),
      estado,
    });
    onClose();
  }

  return (
    <dialog ref={dialogRef} onCancel={onClose} aria-labelledby="laboratorio-form-title" className="m-auto max-h-[90dvh] w-[calc(100%-2rem)] max-w-xl overflow-y-auto rounded-2xl bg-white p-6 text-slate-900 shadow-xl backdrop:bg-slate-950/50">
      <div className="mb-5 flex items-center justify-between gap-4">
        <h3 id="laboratorio-form-title" className="text-xl font-bold">{laboratorio ? 'Editar laboratorio' : 'Nuevo laboratorio'}</h3>
        <button type="button" onClick={onClose} aria-label="Cerrar formulario" className="cursor-pointer rounded-lg p-2 hover:bg-slate-100">
          <X className="h-5 w-5" aria-hidden="true" />
        </button>
      </div>
      <form onSubmit={handleSubmit} className="space-y-4">
        <p className="text-sm text-slate-500">Datos de demostración. Los cambios se perderán al recargar la página.</p>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          {campos.map((campo) => (
            <label key={campo.name} className="flex flex-col gap-1 text-sm font-medium">
              {campo.label}
              <input name={campo.name} type={campo.type} min={'min' in campo ? campo.min : undefined} step={campo.type === 'number' ? 1 : undefined} required defaultValue={laboratorio?.[campo.name] ?? (campo.type === 'number' ? campo.name === 'capacidad' ? 1 : 0 : '')} className="w-full rounded-lg border border-slate-300 px-3 py-2 focus:outline-2 focus:outline-blue-600" />
            </label>
          ))}
          <label className="flex flex-col gap-1 text-sm font-medium">
            Estado
            <select name="estado" defaultValue={laboratorio?.estado ?? 'Operativo'} className="rounded-lg border border-slate-300 px-3 py-2 focus:outline-2 focus:outline-blue-600">
              <option value="Operativo">Operativo</option>
              <option value="Mantenimiento">Mantenimiento</option>
            </select>
          </label>
        </div>
        {error && <p role="alert" className="text-sm text-red-600">{error}</p>}
        <div className="flex justify-end gap-3 pt-2">
          <button type="button" onClick={onClose} className="cursor-pointer rounded-xl border border-slate-300 px-4 py-2 hover:bg-slate-50">Cancelar</button>
          <button type="submit" className="cursor-pointer rounded-xl bg-blue-600 px-4 py-2 font-semibold text-white hover:bg-blue-700">Guardar</button>
        </div>
      </form>
    </dialog>
  );
}
