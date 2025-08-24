import { describe, it, expect } from "vitest";
import { POST } from "./route";

describe("compose API", () => {
  it("returns a draft for valid input", async () => {
    const req = new Request("http://localhost/api/compose", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        businessName: "Acme",
        customerName: "Jane",
        invoiceNumber: "INV-1",
        amountDue: 10,
        currency: "USD",
        daysOverdue: 2,
      }),
    });
    const res = await POST(req);
    const json = await(res as Response).json() as { data: { subject: string } };
    expect(json.data.subject).toContain("INV-1");
  });
});
