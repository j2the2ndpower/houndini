export type TemplateVars = Record<string, unknown>;

function formatValue(value: unknown): string {
  if (value == null) return "";
  if (typeof value === "number") return String(value);
  if (value instanceof Date) return value.toLocaleDateString();
  return String(value);
}

/**
 * Very small mustache-like renderer: replaces {{key}} with stringified vars[key].
 */
export function renderTemplate(template: string, vars: TemplateVars): string {
  return template.replace(/\{\{\s*([\w.]+)\s*\}\}/g, (_m, key: string) => {
    const parts = key.split(".");
    let cur: any = vars;
    for (const p of parts) {
      if (cur == null) return "";
      cur = cur[p];
    }
    return formatValue(cur);
  });
}

export function formatCurrency(amount: number, currency: string, locale?: string): string {
  try {
    return new Intl.NumberFormat(locale, { style: "currency", currency }).format(amount);
  } catch {
    return `${currency} ${amount.toFixed(2)}`;
  }
}


