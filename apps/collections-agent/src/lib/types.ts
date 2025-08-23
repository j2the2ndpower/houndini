export type OverdueInvoice = {
  id: string;
  number: string | null;
  amountDue: number;
  currency: string;
  customerId: string | null;
  customerName: string;
  customerEmail: string | null;
  dueDateISO?: string;
  daysOverdue: number;
  hostedInvoiceUrl: string | null;
  stopped?: boolean;
};

export type SendLog = {
  id: string;
  invoiceId: string;
  stepId: string;
  to: string;
  atISO: string;
};


