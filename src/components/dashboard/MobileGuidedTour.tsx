import { useEffect, useId, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { useOutletContext } from 'react-router-dom';
import { ArrowLeft, ArrowRight, Check, X } from 'lucide-react';
import Button from '../Button';
import type { MenuContext } from '../../layouts/DashboardLayout';
import type { TourStep } from './GuidedTour';
import { mobileTourPosition } from '../../utils/mobileTourPosition';

interface Props {
  steps: TourStep[];
  stepIndex: number;
  onNext: () => void;
  onPrevious: () => void;
  onClose: () => void;
  noShowAgain: boolean;
  onNoShowAgain: (value: boolean) => void;
}

interface Highlight { target: string; top: number; left: number; width: number; height: number; }
interface Layout {
  stepIndex: number;
  highlight: Highlight | null;
  top: number;
  arrow: 'top' | 'bottom' | null;
  arrowLeft: number;
}

export default function MobileGuidedTour({ steps, stepIndex, onNext, onPrevious, onClose, noShowAgain, onNoShowAgain }: Props) {
  const { menuAbierto, cambiarMenu } = useOutletContext<MenuContext>();
  const initialMenu = useRef(menuAbierto);
  const dialogRef = useRef<HTMLDivElement>(null);
  const cardRef = useRef<HTMLDivElement>(null);
  const headingRef = useRef<HTMLHeadingElement>(null);
  const id = useId();
  const [layout, setLayout] = useState<Layout>({ stepIndex: -1, highlight: null, top: 12, arrow: null, arrowLeft: 30 });
  const step = steps[stepIndex];
  const welcome = stepIndex === 0;
  const sidebarStep = !welcome && step?.target.startsWith('sidebar-');
  const last = stepIndex === steps.length - 1;
  const ready = layout.stepIndex === stepIndex;
  const visibleHighlight = layout.highlight;

  // La capa se renderiza siempre; no depende de showModal() durante una recarga de Vite.
  useEffect(() => {
    const previousFocus = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    const bodyOverflow = document.body.style.overflow;
    const htmlOverflow = document.documentElement.style.overflow;
    const menuBeforeTour = initialMenu.current;
    document.body.style.overflow = 'hidden';
    document.documentElement.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = bodyOverflow;
      document.documentElement.style.overflow = htmlOverflow;
      cambiarMenu(menuBeforeTour);
      previousFocus?.focus({ preventScroll: true });
    };
  }, [cambiarMenu]);

  useEffect(() => {
    function handleKey(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        event.preventDefault();
        onClose();
      }
      if (event.key !== 'Tab') return;
      const dialog = dialogRef.current;
      const controls = dialog?.querySelectorAll<HTMLElement>('button:not([disabled]):not([tabindex="-1"]), input:not([disabled])');
      if (!dialog || !controls?.length) return;
      const first = controls[0];
      const last = controls[controls.length - 1];
      const focused = document.activeElement;
      if (event.shiftKey && (focused === first || focused === headingRef.current || !dialog.contains(focused))) {
        event.preventDefault(); last.focus();
      } else if (!event.shiftKey && (focused === last || !dialog.contains(focused))) {
        event.preventDefault(); first.focus();
      }
    }
    document.addEventListener('keydown', handleKey, true);
    return () => document.removeEventListener('keydown', handleKey, true);
  }, [onClose]);

  useEffect(() => {
    cambiarMenu(Boolean(sidebarStep));
  }, [sidebarStep, cambiarMenu]);

  useEffect(() => {
    if (!step) return;
    let disposed = false;
    let frame = 0;
    let scrolledElement: HTMLElement | null = null;
    const sidebar = document.getElementById('sidebar');
    const targetName = step.target === 'header-user-info' ? 'header-user-avatar' : step.target;

    function update() {
      if (disposed) return;
      const card = cardRef.current;
      const cardHeight = card?.offsetHeight ?? 250;
      const overview = step.target === 'sidebar-nav';
      const target = overview ? sidebar : document.querySelector<HTMLElement>(`[data-tour="${targetName}"]`);
      if (welcome || !target || !target.getClientRects().length) {
        setLayout({ stepIndex, highlight: null, ...mobileTourPosition(null, cardHeight, window.innerHeight), arrowLeft: 30 });
        return;
      }
      if (target !== scrolledElement) {
        // Recupera el inicio del dashboard tras explicar un gráfico inferior.
        // No uses scrollIntoView en el header: puede dejarlo recortado.
        if (target.closest('header')) window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
        else if (!overview) target.scrollIntoView({ behavior: 'instant', block: 'nearest', inline: 'nearest' });
        scrolledElement = target;
      }
      const rect = target.getBoundingClientRect();
      const left = Math.max(8, rect.left - 5);
      const top = Math.max(8, rect.top - 5);
      const right = Math.min(window.innerWidth - 8, rect.right + 5);
      const bottom = Math.min(window.innerHeight - 8, rect.bottom + 5);
      const highlight = right > left && bottom > top
        ? { target: step.target, left, top, width: right - left, height: bottom - top } : null;
      const cardRect = card?.getBoundingClientRect();
      const arrowLeft = Math.max(20, Math.min((rect.left + rect.right) / 2 - (cardRect?.left ?? 12), (cardRect?.width ?? 300) - 20));
      const nextLayout = { stepIndex, highlight, ...mobileTourPosition(highlight ? rect : null, cardHeight, window.innerHeight, overview), arrowLeft };
      // Evita repintados repetidos por observadores cuando la geometría no cambió.
      setLayout((previous) => JSON.stringify(previous) === JSON.stringify(nextLayout) ? previous : nextLayout);
    }
    function schedule() {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(update);
    }
    // Espera al render de React y al layout del menú antes de medir.
    frame = requestAnimationFrame(() => {
      frame = requestAnimationFrame(() => {
        headingRef.current?.focus({ preventScroll: true });
        update();
      });
    });
    const observer = new ResizeObserver(schedule);
    if (cardRef.current) observer.observe(cardRef.current);
    if (sidebar) observer.observe(sidebar);
    const target = document.querySelector(`[data-tour="${targetName}"]`);
    if (target) observer.observe(target);
    // También recupera objetivos que aparecen al terminar de cargar el dashboard.
    const mutation = new MutationObserver((records) => {
      if (records.some((record) => record.type === 'childList' || (record.type === 'attributes' && record.target === sidebar))) schedule();
    });
    const root = document.getElementById('root');
    if (root) mutation.observe(root, { childList: true, subtree: true, attributes: true, attributeFilter: ['class'] });
    window.addEventListener('resize', schedule);
    document.addEventListener('scroll', schedule, true);
    return () => {
      disposed = true;
      cancelAnimationFrame(frame);
      observer.disconnect();
      mutation.disconnect();
      window.removeEventListener('resize', schedule);
      document.removeEventListener('scroll', schedule, true);
    };
  }, [step, stepIndex, welcome]);

  return createPortal(
    <div
      ref={dialogRef}
      role="dialog"
      aria-modal="true"
      aria-labelledby={`${id}-title`}
      aria-describedby={`${id}-content`}
      className="fixed inset-0 z-9999 isolate m-0 h-dvh w-screen overflow-hidden bg-transparent p-0 text-left"
    >
      <button type="button" aria-label="Cerrar tutorial pulsando fuera" tabIndex={-1} onClick={onClose} className="absolute inset-0 h-full w-full cursor-default border-0 bg-transparent" />
      {visibleHighlight ? <>
        <div className="pointer-events-none absolute rounded-xl transition-[top,left,width,height] duration-250 ease-out motion-reduce:transition-none" style={{ top: visibleHighlight.top, left: visibleHighlight.left, width: visibleHighlight.width, height: visibleHighlight.height, boxShadow: '0 0 0 9999px rgba(0,0,0,0.6)', outline: '2px solid #c4b5fd' }} aria-hidden="true" />
      </> : <div className="pointer-events-none absolute inset-0 bg-black/60" aria-hidden="true" />}

      <div className="pointer-events-none absolute inset-x-0 flex justify-center px-3 transition-[top,opacity] duration-250 ease-out motion-reduce:transition-none" style={{ top: layout.top, opacity: ready ? 1 : 0 }}>
        <div ref={cardRef} className={`relative w-full max-w-lg ${ready ? 'pointer-events-auto' : 'pointer-events-none'}`}>
          {layout.arrow && <span aria-hidden="true" className={`absolute z-10 h-3 w-3 -translate-x-1/2 rotate-45 border-(--border-color) bg-(--surface) ${layout.arrow === 'top' ? '-top-1.5 border-l border-t' : '-bottom-1.5 border-b border-r'}`} style={{ left: layout.arrowLeft }} />}
          <div className="relative flex max-h-[80dvh] w-full flex-col overflow-hidden rounded-2xl border border-(--border-color) bg-(--surface) text-(--text-primary) shadow-2xl">
          <div className="h-1 shrink-0 bg-(--surface-muted)" aria-hidden="true">
            <div className="h-full bg-linear-to-r from-violet-500 to-indigo-500 transition-[width] duration-300 motion-reduce:transition-none" style={{ width: `${(stepIndex + 1) / steps.length * 100}%` }} />
          </div>
          <div className="flex shrink-0 items-start justify-between gap-3 px-4 pb-2 pt-4">
            <div className="min-w-0">
              <p className="mb-1 text-xs font-semibold text-(--tone-violet-text-700)" aria-live="polite">Paso {stepIndex + 1} de {steps.length}</p>
              <h3 ref={headingRef} tabIndex={-1} id={`${id}-title`} className="text-base font-bold leading-snug outline-none">{step?.title ?? 'Guía del sistema'}</h3>
            </div>
            <Button variant="cancel" appearance="soft" size="custom" onClick={onClose} aria-label="Cerrar tutorial" className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg">
              <X className="h-4 w-4" aria-hidden="true" />
            </Button>
          </div>
          <div className="min-h-0 overflow-y-auto overscroll-contain px-4 pb-3">
            <p id={`${id}-content`} className="text-sm leading-relaxed text-(--text-secondary)">{step?.mobileContent ?? step?.content}</p>
          </div>
          <div className="flex shrink-0 flex-wrap items-center justify-between gap-3 border-t border-(--border-color) px-4 py-3">
            <label className="flex cursor-pointer items-center gap-2 text-xs text-(--text-secondary)">
              <input type="checkbox" checked={noShowAgain} onChange={(event) => onNoShowAgain(event.target.checked)} className="h-4 w-4 accent-violet-600" />
              No mostrar de nuevo
            </label>
            <div className="ml-auto flex items-center gap-2">
              <Button variant="neutral" appearance="soft" size="custom" disabled={welcome} onClick={onPrevious} className="inline-flex h-10 items-center gap-1 rounded-xl px-3 text-xs font-semibold">
                <ArrowLeft className="h-4 w-4" aria-hidden="true" />Anterior
              </Button>
              <Button variant="info" size="custom" onClick={onNext} className="inline-flex h-10 items-center gap-1 rounded-xl px-3 text-xs font-semibold">
                {last ? 'Finalizar' : 'Siguiente'}{last ? <Check className="h-4 w-4" aria-hidden="true" /> : <ArrowRight className="h-4 w-4" aria-hidden="true" />}
              </Button>
            </div>
          </div>
          </div>
        </div>
      </div>
    </div>, document.body,
  );
}
