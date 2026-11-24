import Button from '../Button';
import { Building2, ChevronRight, EllipsisVertical, MapPin, Trash2 } from "lucide-react";
import { Link } from 'react-router-dom';
import type { Laboratorio } from "../../types/laboratorio";

interface LaboratorioCardProps {
    laboratorio: Laboratorio;
    onEdit?: (laboratorio: Laboratorio) => void;
    onDelete?: (laboratorio: Laboratorio) => void;
}

export default function LaboratorioCard({
    laboratorio,
    onEdit,
    onDelete,
    }: LaboratorioCardProps) {
    const estadoClasses =
        laboratorio.estado === "Operativo"
        ? "bg-(--tone-emerald-bg-50) text-(--tone-emerald-text-700) border-(--tone-emerald-border-200)"
        : laboratorio.estado === 'Mantenimiento' ? "bg-(--tone-amber-bg-50) text-(--tone-amber-text-700) border-(--tone-amber-border-200)" : 'bg-(--surface-subtle) text-(--text-secondary) border-(--border-color)';

    return (
        <article className="flex h-full min-w-0 flex-col rounded-2xl border border-(--border-color) bg-(--surface) p-6 text-left">
        <div className="mb-5 flex items-start justify-between gap-3">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-(--tone-blue-bg-50) text-(--tone-blue-text-600)">
            <Building2 className="h-6 w-6" aria-hidden="true" />
            </div>
            <div className="flex items-center gap-1">
            <span
                className={`rounded border px-2 py-0.5 text-xs font-semibold ${estadoClasses}`}
            >
                {laboratorio.estado}
            </span>
            {(onEdit || onDelete) && <details className="relative">
                <summary
                aria-label={`Acciones de ${laboratorio.nombre}`}
                className="flex h-8 w-8 cursor-pointer list-none items-center justify-center rounded-lg text-(--text-secondary) hover:bg-(--surface-muted) focus-visible:outline-2 focus-visible:outline-blue-600 [&::-webkit-details-marker]:hidden"
                >
                <EllipsisVertical className="h-5 w-5" aria-hidden="true" />
                </summary>
                <div className="absolute right-0 z-10 mt-1 w-44 rounded-xl border border-(--border-color) bg-(--surface) p-1 shadow-lg">
                {onEdit && <Button variant="info" appearance="soft" size="custom"
                    type="button"
                    onClick={(event) => {
                    event.currentTarget
                        .closest("details")
                        ?.removeAttribute("open");
                    onEdit(laboratorio);
                    }}
                    className="w-full cursor-pointer rounded-lg px-3 py-2 text-left text-sm"
                >
                    Editar laboratorio
                </Button>}
                {onDelete && <Button variant="danger" appearance="soft" size="custom"
                    aria-label={`Eliminar laboratorio ${laboratorio.nombre}`}
                    onClick={(event) => {
                        event.currentTarget.closest('details')?.removeAttribute('open');
                        onDelete(laboratorio);
                    }}
                    className="mt-1 inline-flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-sm"
                >
                    <Trash2 className="h-4 w-4 shrink-0" aria-hidden="true" />
                    Eliminar
                </Button>}
                </div>
            </details>}
            </div>
        </div>

        <h3 className="text-base font-bold leading-snug text-(--text-primary)">
            {laboratorio.nombre}
        </h3>
        <p className="mt-1 flex items-start gap-2 text-sm text-(--text-secondary)">
            <MapPin className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
            <span>
            {laboratorio.pabellon} · {laboratorio.piso}
            </span>
        </p>

        <dl className="mt-auto grid grid-cols-3 gap-2 pt-5 text-center">
            {[
            { label: "Capacidad", value: laboratorio.capacidad ?? '—' },
            { label: "PCs", value: laboratorio.cantidadPCs },
            { label: "Encargado", value: laboratorio.encargado },
            ].map(({ label, value }) => (
            <div key={label} className="min-w-0 border-y border-(--border-color) py-4">
                <dd
                className={`wrap-break-words font-bold text-(--text-primary) ${label === "Encargado" ? "text-sm leading-7" : "text-xl"}`}
                >
                {value}
                </dd>
                <dt className="text-sm text-(--text-secondary)">{label}</dt>
            </div>
            ))}
        </dl>
        <Link to={`/dashboard/laboratorios/${laboratorio.id}`} aria-label={`Ver equipos de ${laboratorio.nombre}`} className="mt-3 flex items-center justify-between rounded-lg py-2 text-sm text-(--text-secondary) transition-colors hover:bg-(--tone-blue-bg-50) hover:text-(--tone-blue-text-600) focus-visible:outline-2 focus-visible:outline-blue-600">
            <span>{laboratorio.cantidadEquipos} equipo{laboratorio.cantidadEquipos !== 1 ? "s" : ""}</span>
            <ChevronRight className="h-5 w-5" aria-hidden="true" />
        </Link>
        </article>
    );
}
