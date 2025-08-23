import { logger } from "@/lib/logger";
import type { EmailProvider } from "@/lib/providers";
import { OutlookProvider, GmailProvider, SmtpProvider } from "@/lib/providers";
import { store } from "@/lib/store";

const byName: Record<string, EmailProvider> = {
  outlook: OutlookProvider,
  gmail: GmailProvider,
  smtp: SmtpProvider,
};

export class Mailer {
  private providers: EmailProvider[];

  constructor(providers?: EmailProvider[]) {
    this.providers = providers ?? [
      OutlookProvider,
      GmailProvider,
      SmtpProvider,
    ];
  }

  static async fromSettings(): Promise<Mailer> {
    const settings = await store.readSettings();
    const order =
      settings.emailProviderOrder && settings.emailProviderOrder.length
        ? settings.emailProviderOrder
        : ["outlook", "gmail", "smtp"];
    const providers = order.map((n) => byName[n]).filter(Boolean);
    return new Mailer(providers);
  }

  async send(
    to: string,
    subject: string,
    text: string
  ): Promise<{ provider: string }> {
    for (const p of this.providers) {
      try {
        const ok = await p.send(to, subject, text);
        if (ok) {
          logger.info("sent via", p.name, to);
          return { provider: p.name };
        }
      } catch (e) {
        logger.warn("provider failed", p.name, (e as Error)?.message ?? e);
      }
    }
    throw new Error("No email provider available");
  }
}
