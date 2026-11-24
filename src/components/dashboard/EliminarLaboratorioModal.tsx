import { useEffect, useRef, useState } from 'react';
import { Trash2, X } from 'lucide-react';
import Button from '../Button';
import type { Laboratorio } from '../../types/laboratorio';
import { useDialogOutsideClose } from './useDialogOutsideClose';

interface Props {
  laboratorio: Laboratorio;
  onDelete: (id: string) => Promise<void>;
  onClose: () => void;
}

export default function EliminarLaboratorioModal({ laboratorio, onDelete, onClose }: Props) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const [eliminando, setEliminando] = useState(false);
  const [error, setError] = useState('');
  const outsideClose = useDialogOutsideClose(onClose, eliminando);

  useEffect(() => {
    const dialog = dialogRef.current;
    dialog?.showModal();
    return () => dialog?.close();
  }, []);

  async function confirmar() {
    if (eliminando) return;
    setEliminando(true);
    setError('');
    try {
      await onDelete(laboratorio.id);
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No se pudo eliminar el laboratorio.');
      setEliminando(false);
    }
  }

  return (
    <dialog
      ref={dialogRef}
      {...outsideClose}
      onCancel={(event) => { if (eliminando) event.preventDefault(); else onClose(); }}
      aria-labelledby="eliminar-laboratorio-title"
      aria-describedby="eliminar-laboratorio-description"
      className="m-auto max-h-[90dvh] w-[calc(100%-2rem)] max-w-md overflow-y-auto rounded-2xl bg-(--surface) p-6 text-left text-(--text-primary) shadow-xl backdrop:bg-slate-950/50"
    >
      <div className="mb-4 flex items-center justify-between gap-3">
        <h3 id="eliminar-laboratorio-title" className="text-xl font-bold">Eliminar laboratorio</h3>
        <Button variant="cancel" appearance="soft" size="custom" disabled={eliminando} onClick={onClose} aria-label="Cerrar confirmación" className="rounded-lg p-2">
          <X className="h-5 w-5" aria-hidden="true" />
        </Button>
      </div>
      <p id="eliminar-laboratorio-description" className="text-sm text-(--text-primary)">
        ¿Deseas eliminar <strong>{laboratorio.nombre}</strong>? Esta acción no se puede deshacer.
      </p>
      <p className="mt-3 text-sm text-(--text-secondary)">Solo se pueden eliminar laboratorios sin equipos ni incidencias asociados.</p>
      {error && <p role="alert" className="mt-4 text-sm text-(--tone-red-text-700)">{error}</p>}
      <div className="mt-6 flex flex-wrap justify-end gap-3">
        <Button variant="cancel" appearance="soft" size="sm" disabled={eliminando} onClick={onClose} autoFocus>Cancelar</Button>
        <Button variant="danger" appearance="soft" size="sm" disabled={eliminando} onClick={confirmar} aria-busy={eliminando}>
          <Trash2 className="h-4 w-4" aria-hidden="true" />
          {eliminando ? 'Eliminando…' : 'Eliminar'}
        </Button>
      </div>
    </dialog>
  );
}
