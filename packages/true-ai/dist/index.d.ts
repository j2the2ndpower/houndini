export type ComposeParams = {
    businessName: string;
    customerName: string;
    invoiceNumber: string;
    amountDue: number;
    currency: string;
    daysOverdue: number;
    dueDateISO?: string;
    tone?: "friendly" | "firm" | "professional";
};
export type ComposeResult = {
    subject: string;
    bodyText: string;
};
export declare function composeReminder(params: ComposeParams): ComposeResult;
export * from "./sequences";
export * from "./templates";
