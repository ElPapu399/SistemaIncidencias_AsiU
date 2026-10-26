import { useState, useEffect, useCallback, useRef } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faArrowRight,
  faArrowLeft,
  faXmark,
  faCircleQuestion,
  faRocket,
  faCheckCircle,
} from '@fortawesome/free-solid-svg-icons';

export interface TourStep {
  target: string;       // data-tour attribute value
  title: string;
  content: string;
  position?: 'top' | 'bottom' | 'left' | 'right';
}

interface GuidedTourProps {
  steps: TourStep[];
  storageKey: string;
  onComplete?: () => void;
}

const TOOLTIP_GAP = 14;
const PADDING = 8;

export default function GuidedTour({ steps, storageKey, onComplete }: GuidedTourProps) {
  const [active, setActive] = useState(false);
  const [stepIndex, setStepIndex] = useState(0);
  const [tooltipStyle, setTooltipStyle] = useState<React.CSSProperties>({});
  const [highlightStyle, setHighlightStyle] = useState<React.CSSProperties>({});
  const [noShowAgain, setNoShowAgain] = useState(false);
  const [arrowClass, setArrowClass] = useState('');
  const [fadeIn, setFadeIn] = useState(false);
  const tooltipRef = useRef<HTMLDivElement>(null);

  const currentStep = steps[stepIndex];

  // Auto-show on mount if not dismissed
  useEffect(() => {
    const dismissed = localStorage.getItem(storageKey);
    if (dismissed !== 'true') {
      const timer = setTimeout(() => setActive(true), 600);
      return () => clearTimeout(timer);
    }
  }, [storageKey]);

  const positionTooltip = useCallback(() => {
    if (!currentStep || !active) return;

    const el = document.querySelector(`[data-tour="${currentStep.target}"]`);
    if (!el) return;

    const rect = el.getBoundingClientRect();
    const tooltipEl = tooltipRef.current;
    const tooltipWidth = tooltipEl?.offsetWidth || 360;
    const tooltipHeight = tooltipEl?.offsetHeight || 200;

    // Highlight around the target element
    setHighlightStyle({
      top: rect.top - PADDING,
      left: rect.left - PADDING,
      width: rect.width + PADDING * 2,
      height: rect.height + PADDING * 2,
      borderRadius: '12px',
    });

    // Scroll element into view if needed
    el.scrollIntoView({ behavior: 'smooth', block: 'nearest' });

    // Determine best position
    const pos = currentStep.position || autoBestPosition(rect, tooltipWidth, tooltipHeight);

    const style: React.CSSProperties = { position: 'fixed' };

    switch (pos) {
      case 'bottom':
        style.top = rect.bottom + TOOLTIP_GAP;
        style.left = Math.max(12, Math.min(rect.left + rect.width / 2 - tooltipWidth / 2, window.innerWidth - tooltipWidth - 12));
        setArrowClass('tour-arrow-top');
        break;
      case 'top':
        style.top = rect.top - tooltipHeight - TOOLTIP_GAP;
        style.left = Math.max(12, Math.min(rect.left + rect.width / 2 - tooltipWidth / 2, window.innerWidth - tooltipWidth - 12));
        setArrowClass('tour-arrow-bottom');
        break;
      case 'right':
        style.top = Math.max(12, rect.top + rect.height / 2 - tooltipHeight / 2);
        style.left = rect.right + TOOLTIP_GAP;
        setArrowClass('tour-arrow-left');
        break;
      case 'left':
        style.top = Math.max(12, rect.top + rect.height / 2 - tooltipHeight / 2);
        style.left = rect.left - tooltipWidth - TOOLTIP_GAP;
        setArrowClass('tour-arrow-right');
        break;
    }

    setTooltipStyle(style);
  }, [currentStep, active]);

  useEffect(() => {
    if (!active) return;
    setFadeIn(false);
    const raf = requestAnimationFrame(() => {
      positionTooltip();
      requestAnimationFrame(() => setFadeIn(true));
    });
    window.addEventListener('resize', positionTooltip);
    window.addEventListener('scroll', positionTooltip, true);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener('resize', positionTooltip);
      window.removeEventListener('scroll', positionTooltip, true);
    };
  }, [active, stepIndex, positionTooltip]);

  const closeTour = useCallback(() => {
    setActive(false);
    setStepIndex(0);
    if (noShowAgain) {
      localStorage.setItem(storageKey, 'true');
    }
    onComplete?.();
  }, [noShowAgain, storageKey, onComplete]);

  const next = () => {
    if (stepIndex < steps.length - 1) setStepIndex(stepIndex + 1);
    else closeTour();
  };

  const prev = () => {
    if (stepIndex > 0) setStepIndex(stepIndex - 1);
  };

  const isLastStep = stepIndex === steps.length - 1;
  const isFirstStep = stepIndex === 0;
  const progress = ((stepIndex + 1) / steps.length) * 100;

  if (!active) {
    return (
      <button
        type="button"
        onClick={() => { setStepIndex(0); setActive(true); }}
        className="
          fixed bottom-6 right-6 z-[9999]
          w-12 h-12 rounded-full
          bg-gradient-to-br from-violet-500 to-indigo-600
          text-white shadow-lg shadow-violet-500/30
          flex items-center justify-center
          hover:scale-110 hover:shadow-xl hover:shadow-violet-500/40
          transition-all duration-300 cursor-pointer
          animate-[tour-pulse_2s_ease-in-out_infinite]
        "
        title="Iniciar tutorial"
        aria-label="Iniciar tutorial guiado"
      >
        <FontAwesomeIcon icon={faCircleQuestion} className="text-lg" />
      </button>
    );
  }

  return (
    <>
      {/* Overlay */}
      <div
        className="fixed inset-0 z-[9990] transition-opacity duration-300"
        style={{ background: 'rgba(0,0,0,0.55)' }}
        onClick={closeTour}
      />

      {/* Highlight cutout */}
      <div
        className="fixed z-[9991] pointer-events-none transition-all duration-400 ease-out"
        style={{
          ...highlightStyle,
          boxShadow: '0 0 0 9999px rgba(0,0,0,0.55), 0 0 20px 4px rgba(139,92,246,0.35)',
        }}
      />

      {/* Tooltip */}
      <div
        ref={tooltipRef}
        className={`
          fixed z-[9995] w-[360px] max-w-[calc(100vw-24px)]
          bg-white rounded-2xl shadow-2xl shadow-black/20
          border border-slate-200
          transition-all duration-300 ease-out
          ${arrowClass}
          ${fadeIn ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2'}
        `}
        style={tooltipStyle}
      >
        {/* Progress bar */}
        <div className="h-1 bg-slate-100 rounded-t-2xl overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-violet-500 to-indigo-500 transition-all duration-500 ease-out"
            style={{ width: `${progress}%` }}
          />
        </div>

        {/* Header */}
        <div className="flex items-start justify-between px-5 pt-4 pb-2">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-violet-100 flex items-center justify-center shrink-0">
              <FontAwesomeIcon icon={isLastStep ? faCheckCircle : faRocket} className="text-violet-600 text-sm" />
            </div>
            <div>
              <p className="text-[11px] font-semibold text-violet-500 uppercase tracking-wider">
                Paso {stepIndex + 1} de {steps.length}
              </p>
              <h3 className="text-[15px] font-bold text-slate-900 leading-snug">
                {currentStep?.title}
              </h3>
            </div>
          </div>
          <button
            type="button"
            onClick={closeTour}
            className="w-7 h-7 rounded-lg flex items-center justify-center text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer shrink-0"
            aria-label="Cerrar tutorial"
          >
            <FontAwesomeIcon icon={faXmark} />
          </button>
        </div>

        {/* Content */}
        <div className="px-5 pb-3">
          <p className="text-[13px] text-slate-600 leading-relaxed">
            {currentStep?.content}
          </p>
        </div>

        {/* Footer */}
        <div className="px-5 pb-4 flex items-center justify-between gap-3">
          <label className="flex items-center gap-2 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={noShowAgain}
              onChange={(e) => setNoShowAgain(e.target.checked)}
              className="w-3.5 h-3.5 rounded accent-violet-500"
            />
            <span className="text-[11px] text-slate-400">No mostrar de nuevo</span>
          </label>

          <div className="flex items-center gap-2">
            {!isFirstStep && (
              <button
                type="button"
                onClick={prev}
                className="h-8 px-3 rounded-lg text-xs font-medium text-slate-600 bg-slate-100 hover:bg-slate-200 transition-colors cursor-pointer flex items-center gap-1.5"
              >
                <FontAwesomeIcon icon={faArrowLeft} className="text-[10px]" />
                Anterior
              </button>
            )}
            <button
              type="button"
              onClick={next}
              className={`
                h-8 px-4 rounded-lg text-xs font-semibold text-white
                flex items-center gap-1.5 cursor-pointer transition-all duration-200
                ${isLastStep
                  ? 'bg-gradient-to-r from-emerald-500 to-green-500 hover:shadow-lg hover:shadow-emerald-500/30'
                  : 'bg-gradient-to-r from-violet-500 to-indigo-600 hover:shadow-lg hover:shadow-violet-500/30'
                }
              `}
            >
              {isLastStep ? '¡Entendido!' : 'Siguiente'}
              {!isLastStep && <FontAwesomeIcon icon={faArrowRight} className="text-[10px]" />}
            </button>
          </div>
        </div>
      </div>
    </>
  );
}

// Determine best tooltip position based on available space
function autoBestPosition(
  rect: DOMRect,
  tooltipW: number,
  tooltipH: number,
): 'top' | 'bottom' | 'left' | 'right' {
  const spaceBelow = window.innerHeight - rect.bottom;
  const spaceAbove = rect.top;
  const spaceRight = window.innerWidth - rect.right;
  const spaceLeft = rect.left;

  if (spaceBelow >= tooltipH + TOOLTIP_GAP) return 'bottom';
  if (spaceAbove >= tooltipH + TOOLTIP_GAP) return 'top';
  if (spaceRight >= tooltipW + TOOLTIP_GAP) return 'right';
  if (spaceLeft >= tooltipW + TOOLTIP_GAP) return 'left';
  return 'bottom';
}
