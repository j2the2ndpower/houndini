import nodemailer from "nodemailer";

export function createSmtpTransport() {
  const host = process.env.SMTP_HOST;
  const port = Number(process.env.SMTP_PORT || 587);
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;
  const from = process.env.SMTP_FROM || user;
  if (!host || !user || !pass || !from) {
    throw new Error(
      "SMTP not configured (SMTP_HOST, SMTP_USER, SMTP_PASS, SMTP_FROM)"
    );
  }
  const transporter = nodemailer.createTransport({
    host,
    port,
    secure: port === 465,
    auth: { user, pass },
  });
  return { transporter, from };
}

export async function sendEmailSimple(
  to: string,
  subject: string,
  text: string
) {
  const { transporter, from } = createSmtpTransport();
  const info = await transporter.sendMail({ from, to, subject, text });
  return info.messageId as string;
}
