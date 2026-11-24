export function mobileTourPosition(
  rect: { top: number; bottom: number } | null,
  cardHeight: number,
  viewportHeight: number,
  overview = false,
) {
  const margin = 12;
  const gap = 12;
  const maxTop = Math.max(margin, viewportHeight - cardHeight - margin);
  // La bienvenida y la explicación general del menú se muestran centradas.
  if (!rect || overview) return { top: Math.max(margin, (viewportHeight - cardHeight) / 2), arrow: null };
  if (rect.bottom + gap + cardHeight <= viewportHeight - margin) {
    return { top: Math.max(margin, rect.bottom + gap), arrow: 'top' as const };
  }
  if (rect.top - gap - cardHeight >= margin) {
    return { top: Math.min(maxTop, rect.top - gap - cardHeight), arrow: 'bottom' as const };
  }
  return { top: rect.top > viewportHeight - rect.bottom ? margin : maxTop, arrow: null };
}
