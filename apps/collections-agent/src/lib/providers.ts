import { sendWithOutlook } from "@/lib/outlook";
import { sendWithGmail } from "@/lib/gmail";
import { createSmtpTransport } from "@/lib/email";

export interface EmailProvider {
  name: string;
  send(to: string, subject: string, text: string): Promise<boolean>;
  check?(): Promise<{ connected: boolean; email?: string | null }>;
}

export const OutlookProvider: EmailProvider = {
  name: "outlook",
  async send(to, subject, text) {
    return sendWithOutlook(to, subject, text);
  },
};

export const GmailProvider: EmailProvider = {
  name: "gmail",
  async send(to, subject, text) {
    return sendWithGmail(to, subject, text);
  },
};

export const SmtpProvider: EmailProvider = {
  name: "smtp",
  async send(to, subject, text) {
    const { transporter, from } = createSmtpTransport();
    await transporter.sendMail({ from, to, subject, text });
    return true;
  },
};


