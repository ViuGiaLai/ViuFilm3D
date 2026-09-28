export function userCardPosition(
  anchor: { left: number; top: number; bottom: number },
  card: { width: number; height: number },
  viewport: { width: number; height: number; top: number },
) {
  const gap = 12;
  const minTop = viewport.top + gap;
  const maxTop = Math.max(
    minTop,
    viewport.top + viewport.height - card.height - gap,
  );
  const below = anchor.bottom + gap;
  const above = anchor.top - card.height - gap;
  return {
    left: Math.max(
      gap,
      Math.min(anchor.left, viewport.width - card.width - gap),
    ),
    top: Math.max(
      minTop,
      Math.min(
        below + card.height <= viewport.top + viewport.height - gap
          ? below
          : above,
        maxTop,
      ),
    ),
  };
}
