function formatValue(value) {
    if (value == null)
        return "";
    if (typeof value === "number")
        return String(value);
    if (value instanceof Date)
        return value.toLocaleDateString();
    return String(value);
}
/**
 * Very small mustache-like renderer: replaces {{key}} with stringified vars[key].
 */
export function renderTemplate(template, vars) {
    return template.replace(/\{\{\s*([\w.]+)\s*\}\}/g, (_m, key) => {
        const parts = key.split(".");
        let cur = vars;
        for (const p of parts) {
            if (cur == null)
                return "";
            cur = cur[p];
        }
        return formatValue(cur);
    });
}
export function formatCurrency(amount, currency, locale) {
    try {
        return new Intl.NumberFormat(locale, { style: "currency", currency }).format(amount);
    }
    catch {
        return `${currency} ${amount.toFixed(2)}`;
    }
}
