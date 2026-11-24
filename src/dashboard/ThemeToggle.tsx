import { useContext, useEffect, useId, useRef, useState } from 'react';
import { Check, Monitor, Moon, Sun } from 'lucide-react';
import { ThemeContext } from '../context/ThemeContext';

const options = [
    { value: 'light', label: 'Claro', icon: Sun },
    { value: 'dark', label: 'Oscuro', icon: Moon },
    { value: 'system', label: 'Automático', icon: Monitor },
] as const;

export default function ThemeToggle() {
    const theme = useContext(ThemeContext);
    const [open, setOpen] = useState(false);
    const containerRef = useRef<HTMLDivElement>(null);
    const buttonRef = useRef<HTMLButtonElement>(null);
    const panelId = useId();

    useEffect(() => {
        if (!open) return;

        function closeOutside(event: PointerEvent) {
        if (
            event.target instanceof Node &&
            !containerRef.current?.contains(event.target)
        ) {
            setOpen(false);
        }
        }

        function closeWithEscape(event: KeyboardEvent) {
        if (event.key === 'Escape') {
            setOpen(false);
            buttonRef.current?.focus();
        }
        }

        const frame = requestAnimationFrame(() => {
        containerRef.current
            ?.querySelector<HTMLButtonElement>('[aria-pressed="true"]')
            ?.focus();
        });

        document.addEventListener('pointerdown', closeOutside);
        document.addEventListener('keydown', closeWithEscape);

        return () => {
        cancelAnimationFrame(frame);
        document.removeEventListener('pointerdown', closeOutside);
        document.removeEventListener('keydown', closeWithEscape);
        };
    }, [open]);

    if (!theme) return null;

    const { preference, setPreference } = theme;
    const selected = options.find((option) => option.value === preference)!;
    const CurrentIcon = selected.icon;

    return (
        <div ref={containerRef} className="relative shrink-0">
        <button
            ref={buttonRef}
            type="button"
            onClick={() => setOpen((value) => !value)}
            aria-label={`Cambiar apariencia. Actual: ${selected.label}`}
            aria-expanded={open}
            aria-controls={open ? panelId : undefined}
            title={`Apariencia: ${selected.label}`}
            className="flex h-9 w-9 items-center justify-center rounded-xl
            border border-(--border-color) bg-(--surface)
            text-(--text-primary) cursor-pointer
            hover:bg-(--app-bg)
            focus-visible:outline-2 focus-visible:outline-blue-500"
        >
            <CurrentIcon className="h-4 w-4" aria-hidden="true" />
        </button>

        {open && (
            <div
            id={panelId}
            role="group"
            aria-label="Apariencia"
            className="absolute right-0 z-50 mt-2 w-40 rounded-xl
                border border-(--border-color) bg-(--surface)
                p-1 shadow-lg"
            >
            {options.map(({ value, label, icon: Icon }) => (
                <button
                key={value}
                type="button"
                aria-pressed={preference === value}
                onClick={() => {
                    setPreference(value);
                    setOpen(false);
                    buttonRef.current?.focus();
                }}
                className="flex w-full items-center gap-2 rounded-lg
                    px-3 py-2 text-left text-sm
                    text-(--text-primary) cursor-pointer
                    hover:bg-(--app-bg)
                    focus-visible:outline-2 focus-visible:outline-blue-500"
                >
                <Icon className="h-4 w-4 shrink-0" aria-hidden="true" />
                <span>{label}</span>
                {preference === value && (
                    <Check
                    className="ml-auto h-4 w-4 text-(--tone-blue-text-500)"
                    aria-hidden="true"
                    />
                )}
                </button>
            ))}
            </div>
        )}
        </div>
    );
}