import { useRef } from 'react';
import type { MouseEvent, PointerEvent } from 'react';

// El backdrop de <dialog> recibe los eventos sobre el propio diálogo.
// Se comprueban las coordenadas para distinguirlo del padding interior.
export function useDialogOutsideClose(onClose: () => void, disabled = false) {
  const startedOutside = useRef(false);
  function outside(event: MouseEvent<HTMLDialogElement> | PointerEvent<HTMLDialogElement>) {
    const rect = event.currentTarget.getBoundingClientRect();
    return event.target === event.currentTarget
      && (event.clientX < rect.left || event.clientX > rect.right || event.clientY < rect.top || event.clientY > rect.bottom);
  }
  return {
    onPointerDown(event: PointerEvent<HTMLDialogElement>) {
      startedOutside.current = outside(event);
    },
    onClick(event: MouseEvent<HTMLDialogElement>) {
      const dismiss = startedOutside.current && outside(event);
      startedOutside.current = false;
      if (dismiss && !disabled) onClose();
    },
  };
}
