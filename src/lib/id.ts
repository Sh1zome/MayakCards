export function uid(prefix = ''): string {
  const id = `${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 9)}`;
  return prefix ? `${prefix}_${id}` : id;
}
