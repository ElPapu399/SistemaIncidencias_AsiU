import type { ReactNode } from 'react';
import { ArrowUpDown, ArrowUp, ArrowDown } from 'lucide-react';
import type { SortDirection } from '../../utils/tableSorting';

interface SortableHeaderProps {
  label: ReactNode;
  field: string;
  currentSortField?: string | null;
  currentDirection?: SortDirection | null;
  onSort: (field: string) => void;
  className?: string;
  align?: 'left' | 'center' | 'right';
  title?: string;
  activeColorClass?: string;
}

export default function SortableHeader({
  label,
  field,
  currentSortField,
  currentDirection,
  onSort,
  className = '',
  align = 'left',
  title,
  activeColorClass = 'text-blue-600',
}: SortableHeaderProps) {
  const isActive = currentSortField === field;
  const isAsc = isActive && currentDirection === 'asc';
  const isDesc = isActive && currentDirection === 'desc';

  const defaultTitle = typeof label === 'string'
    ? `Ordenar por ${label} (${isActive ? (currentDirection === 'asc' ? 'mayor a menor / desc' : 'menor a mayor / asc') : 'clic para ordenar'})`
    : 'Ordenar columna';

  return (
    <th
      scope="col"
      aria-sort={isActive ? (currentDirection === 'asc' ? 'ascending' : 'descending') : 'none'}
      className={`select-none transition-colors group cursor-pointer hover:bg-slate-200/50 ${
        align === 'center' ? 'text-center' : align === 'right' ? 'text-right' : 'text-left'
      } ${className}`}
      onClick={() => onSort(field)}
    >
      <button
        type="button"
        className={`inline-flex items-center gap-1.5 font-semibold text-xs uppercase tracking-wider transition-colors cursor-pointer w-full focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 rounded ${
          align === 'center' ? 'justify-center' : align === 'right' ? 'justify-end' : 'justify-start'
        } ${isActive ? activeColorClass : 'text-slate-600 group-hover:text-slate-900'}`}
        title={title || defaultTitle}
      >
        <span>{label}</span>
        <span className="inline-flex shrink-0 items-center justify-center">
          {isAsc ? (
            <ArrowUp className={`w-3.5 h-3.5 ${activeColorClass}`} aria-hidden="true" />
          ) : isDesc ? (
            <ArrowDown className={`w-3.5 h-3.5 ${activeColorClass}`} aria-hidden="true" />
          ) : (
            <ArrowUpDown
              className="w-3.5 h-3.5 text-slate-400 opacity-40 group-hover:opacity-100 transition-opacity"
              aria-hidden="true"
            />
          )}
        </span>
      </button>
    </th>
  );
}
