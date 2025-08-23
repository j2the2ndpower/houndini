import { describe, it, expect } from "vitest";
import { composeReminder } from "./index";

describe("composeReminder", () => {
  it("creates a professional reminder with subject and body", () => {
    const res = composeReminder({
      businessName: "Acme Inc.",
      customerName: "Jane Doe",
      invoiceNumber: "INV-1001",
      amountDue: 123.45,
      currency: "USD",
      daysOverdue: 5,
    });
    expect(res.subject).toContain("INV-1001");
    expect(res.bodyText).toContain("Jane Doe");
    expect(res.bodyText).toContain("Acme Inc.");
  });
});
