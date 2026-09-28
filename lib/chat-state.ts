export function mergeMessages<T extends { id: number }>(
  current: T[],
  incoming: T[],
): T[] {
  return [
    ...new Map(
      [...current, ...incoming].map((item) => [item.id, item]),
    ).values(),
  ].sort((a, b) => a.id - b.id);
}
export function shouldFollowMessages(
  scrollTop: number,
  scrollHeight: number,
  clientHeight: number,
) {
  return scrollHeight - scrollTop - clientHeight < 80;
}
