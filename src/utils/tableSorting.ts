export type SortDirection = 'asc' | 'desc';

export interface SortState<T extends string = string> {
  field: T;
  direction: SortDirection;
}

const PRIORITY_ORDER: Record<string, number> = {
  critica: 4,
  crítica: 4,
  alta: 3,
  media: 2,
  baja: 1,
};

export function getPriorityWeight(priority: string | null | undefined): number {
  if (!priority) return 0;
  return PRIORITY_ORDER[priority.toLowerCase().trim()] ?? 0;
}

export function comparePriorities(
  a: string | null | undefined,
  b: string | null | undefined,
  direction: SortDirection
): number {
  const weightA = getPriorityWeight(a);
  const weightB = getPriorityWeight(b);
  if (weightA === weightB) return 0;
  return direction === 'asc' ? weightA - weightB : weightB - weightA;
}

export function compareDates(
  a: string | number | Date | null | undefined,
  b: string | number | Date | null | undefined,
  direction: SortDirection
): number {
  const timeA = a ? new Date(a).getTime() : 0;
  const timeB = b ? new Date(b).getTime() : 0;
  if (timeA === timeB) return 0;
  return direction === 'asc' ? timeA - timeB : timeB - timeA;
}

export function compareStrings(
  a: string | null | undefined,
  b: string | null | undefined,
  direction: SortDirection
): number {
  const strA = (a ?? '').trim();
  const strB = (b ?? '').trim();
  const res = strA.localeCompare(strB, 'es', { sensitivity: 'base', numeric: true });
  return direction === 'asc' ? res : -res;
}

export function compareNumbers(
  a: number | null | undefined,
  b: number | null | undefined,
  direction: SortDirection
): number {
  const numA = a ?? 0;
  const numB = b ?? 0;
  if (numA === numB) return 0;
  return direction === 'asc' ? numA - numB : numB - numA;
}

export function getNextDirection(
  currentField: string | null | undefined,
  targetField: string,
  currentDirection: SortDirection | null | undefined,
  defaultDirection: SortDirection = 'asc'
): SortDirection {
  if (currentField === targetField) {
    return currentDirection === 'asc' ? 'desc' : 'asc';
  }
  return defaultDirection;
}
