import { Building2, EllipsisVertical, MapPin } from "lucide-react";
import type { Laboratorio } from "../../types/laboratorio";

interface LaboratorioCardProps {
    laboratorio: Laboratorio;
    onEdit: (laboratorio: Laboratorio) => void;
}

export default function LaboratorioCard({
    laboratorio,
    onEdit,
    }: LaboratorioCardProps) {
    const estadoClasses =
        laboratorio.estado === "Operativo"
        ? "bg-emerald-50 text-emerald-700 border-emerald-200"
        : "bg-amber-50 text-amber-700 border-amber-200";

    return (
        <article className="flex h-full min-w-0 flex-col rounded-2xl border border-slate-200 bg-white p-6 text-left">
        <div className="mb-5 flex items-start justify-between gap-3">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-blue-50 text-blue-600">
            <Building2 className="h-6 w-6" aria-hidden="true" />
            </div>
            <div className="flex items-center gap-1">
            <span
                className={`rounded border px-2 py-0.5 text-xs font-semibold ${estadoClasses}`}
            >
                {laboratorio.estado}
            </span>
            <details className="relative">
                <summary
                aria-label={`Acciones de ${laboratorio.nombre}`}
                className="flex h-8 w-8 cursor-pointer list-none items-center justify-center rounded-lg text-slate-500 hover:bg-slate-100 focus-visible:outline-2 focus-visible:outline-blue-600 [&::-webkit-details-marker]:hidden"
                >
                <EllipsisVertical className="h-5 w-5" aria-hidden="true" />
                </summary>
                <div className="absolute right-0 z-10 mt-1 w-44 rounded-xl border border-slate-200 bg-white p-1 shadow-lg">
                <button
                    type="button"
                    onClick={(event) => {
                    event.currentTarget
                        .closest("details")
                        ?.removeAttribute("open");
                    onEdit(laboratorio);
                    }}
                    className="w-full cursor-pointer rounded-lg px-3 py-2 text-left text-sm hover:bg-slate-100"
                >
                    Editar laboratorio
                </button>
                </div>
            </details>
            </div>
        </div>

        <h3 className="text-base font-bold leading-snug text-slate-900">
            {laboratorio.nombre}
        </h3>
        <p className="mt-1 flex items-start gap-2 text-sm text-slate-500">
            <MapPin className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
            <span>
            {laboratorio.pabellon} · {laboratorio.piso}
            </span>
        </p>

        <dl className="mt-auto grid grid-cols-3 gap-2 pt-5 text-center">
            {[
            { label: "Capacidad", value: laboratorio.capacidad },
            { label: "PCs", value: laboratorio.cantidadPCs },
            { label: "Encargado", value: laboratorio.encargado },
            ].map(({ label, value }) => (
            <div key={label} className="min-w-0 border-y border-slate-200 py-4">
                <dd
                className={`wrap-break-words font-bold text-slate-900 ${label === "Encargado" ? "text-sm leading-7" : "text-xl"}`}
                >
                {value}
                </dd>
                <dt className="text-sm text-slate-500">{label}</dt>
            </div>
            ))}
        </dl>
        <p className="pt-4 text-sm text-slate-500">
            {laboratorio.cantidadEquipos} equipo
            {laboratorio.cantidadEquipos !== 1 ? "s" : ""}
        </p>
        </article>
    );
}