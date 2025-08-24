export type TemplateVars = Record<string, unknown>;
/**
 * Very small mustache-like renderer: replaces {{key}} with stringified vars[key].
 */
export declare function renderTemplate(template: string, vars: TemplateVars): string;
export declare function formatCurrency(amount: number, currency: string, locale?: string): string;
