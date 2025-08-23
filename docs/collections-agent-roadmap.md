## Collections Agent - Market Findings and Roadmap

### Purpose
AI-powered accounts receivable collections for Stripe-first SMBs and mid-market: automate sequences, draft/send on-brand reminders, provide a customer portal and analytics, and sync with accounting/ERP.

### Integrations to Prioritize
- Accounting/ERP: QuickBooks Online, Xero, NetSuite, Sage Intacct, Microsoft Dynamics 365, SAP, Oracle
- Payments: Stripe (current), GoCardless (ACH/debits), Adyen, PayPal; Plaid (bank); Stripe Payment Links
- Email/Deliverability: Gmail OAuth, Microsoft 365 (Graph), SMTP (current), Postmark/SendGrid webhooks
- CRM/Support: Salesforce, HubSpot, Zendesk, Intercom
- Messaging/SMS: Twilio, WhatsApp Business, MessageBird
- Customer Portal: Hosted portal for invoices, statements, disputes, payment plans
- Data/BI: Exports (CSV/S3), connectors (Snowflake/BigQuery/Metabase)
- Identity/Compliance: Google/Azure AD/Okta SSO, roles/permissions, audit logs
- Docs & e-sign: DocuSign/Dropbox Sign (payment plans, settlements)

### Competitive Landscape (snapshot)
- Chaser: Sequences (email/SMS), portal, payment links, multi-currency, QBO/Xero/NetSuite
- Upflow: Sequences, portal, analytics (DSO/aging), QBO/Xero/NetSuite, good team workflows
- Invoiced: Broad AR platform (invoicing, subscriptions, portal, payments), many integrations
- Versapay: Mid-market/enterprise; collaborative portal and dispute workflows; ERP depth
- HighRadius/Esker/Billtrust: Enterprise (cash app, deductions, credit risk, forecasting)
- Kolleno/Gaviti/Growfin/YayPay/Tesorio: SMB–mid-market AR automation, sequences, analytics

Implication: To win SMB–mid-market, we need sequences, portal, multi-channel comms, accounting sync, and clear analytics. Deep cash application/deductions can follow.

### Must‑Have Capabilities to Be Competitive
- Collections automation
  - Multi-step, multi-channel sequences (email/SMS/WhatsApp), quiet hours, time zones, brand templates, localization
  - Smart scheduling, throttling, bounce/opt-out handling, DKIM/SPF guidance; invoice PDFs and statements attachments
- Payments + Portal
  - Hosted customer portal: invoices, statements, pay now (card/ACH), download receipts, update billing details
  - One-click pay links per invoice; late fees/interest; self-serve payment plans and promises-to-pay
  - Real-time status via webhooks; auto-stop sequences on payment
- Intelligence
  - Segmentation (risk/amount/age/behavior), prioritized queues
  - Next-best-action (channel, tone, timing) and send-time optimization
  - Forecasting (expected payment dates, cash-in, DSO trends)
- Workflow
  - Dispute tracking (categories/SLAs), internal notes, assignments, tags, tasks, AR team inbox
  - Activity feed and audit trail
- Platform
  - Integrations above; public API + webhooks; roles/permissions; SSO; multi-currency/language; VAT/GST
  - Data export and BI connectors; deliverability monitoring (bounces, domain warmup)
- Reporting
  - Aging, DSO, sequence performance, collector productivity, funnel (sent→opened→replied→paid)

### Current State (MVP)
- Next.js app (port 3000)
- Fetch overdue Stripe invoices; email draft generation (tone-aware) via shared package
- SMTP send endpoint; mailto/copy actions; basic UI
- Tests for compose and API

### Roadmap (Phased)
Phase 1 – Automate and Send (0–2 weeks)
- Sequences: model, editor UI, per-invoice/customer state machine
- Email OAuth (Gmail, Outlook Graph) + send-as; thread tracking; bounce/opt-out handling
- Stripe webhooks: stop sequences on pay/void; attach payment links in drafts
- Basic analytics: aging summary, sequence performance

Phase 2 – Portal and Payments (2–5 weeks)
- Hosted customer portal: invoice list, statements, pay now (Stripe links/ACH), receipts
- Payment plans/promises-to-pay; late fees; localized templates
- Team workflow: assignments, notes, tags; activity feed and audit trail

Phase 3 – Accounting/CRM Integrations (4–8 weeks)
- QuickBooks/Xero sync (customers, invoices, statuses); read-first, then safe write-backs
- CRM notes sync (Salesforce/HubSpot); support tickets to Zendesk/Intercom for disputes
- Export pipelines (CSV/S3) and BI connectors (Metabase)

Phase 4 – Intelligence & Forecasting (6–10 weeks)
- Segmentation and prioritized queues; send-time optimization
- Next-best-action recommendations (tone/channel/timing)
- Forecasts: expected payment dates, cash-in projections, DSO trends

Phase 5 – Enterprise Options (later)
- SSO (SAML/OIDC), roles/permissions, data residency, SOC2 paths
- Deductions/disputes workflows; cash application assistance; advanced SLA reporting

### KPIs
- DSO reduction, % invoices paid on first/second/final reminder
- Time-to-cash, sequence-to-payment conversion
- Deliverability: open/bounce/complaint rates; portal pay conversion

### Risks & Mitigations
- Email deliverability: domain auth, warmup guidance, reputable ESPs
- PII/security: least-privilege scopes, encryption at rest/in-transit, audit logs
- Integration fragility: webhook retries, idempotency, backoff, monitoring

### Pricing (strawman)
- Starter: per-company base + usage (contacts/sequences sent)
- Growth: adds portal, payments, OAuth, CRM/Accounting sync
- Scale: SSO, advanced analytics, priority support

---
This document will evolve as we validate with users. Priority is Phase 1 (sequences + OAuth + webhooks + analytics) to reach clear value and retention.


