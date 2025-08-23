export function toCsv(rows: Array<Record<string, unknown>>, headers?: string[]): string {
  if (!rows.length) return '';
  const cols = headers ?? Object.keys(rows[0]);
  const esc = (v: unknown) => `"${String(v ?? '').replaceAll('"', '""')}"`;
  const head = cols.join(',');
  const lines = rows.map(r => cols.map(c => esc((r as any)[c])).join(','));
  return [head, ...lines].join('\n');
}


