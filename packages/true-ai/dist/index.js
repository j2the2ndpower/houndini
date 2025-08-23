const tonePreambles = {
    friendly: "Hope you're doing well!",
    firm: "This is a final reminder regarding your outstanding balance.",
    professional: "Following up regarding an outstanding invoice.",
};
export function composeReminder(params) {
    const tone = params.tone ?? "professional";
    const preamble = tonePreambles[tone] ?? tonePreambles.professional;
    const amount = new Intl.NumberFormat(undefined, {
        style: "currency",
        currency: params.currency,
    }).format(params.amountDue);
    const subject = `${params.businessName}: Invoice ${params.invoiceNumber} is ${params.daysOverdue} days overdue`;
    const bodyText = [
        `Hi ${params.customerName},`,
        "",
        preamble,
        "",
        `Invoice ${params.invoiceNumber} for ${amount} is ${params.daysOverdue} days overdue${params.dueDateISO
            ? ` (due ${new Date(params.dueDateISO).toLocaleDateString()})`
            : ""}.`,
        "Please make a payment at your earliest convenience or reply with any questions.",
        "",
        "Thank you,",
        params.businessName,
    ].join("\n");
    return { subject, bodyText };
}
