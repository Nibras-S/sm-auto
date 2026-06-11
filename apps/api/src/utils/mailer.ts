import nodemailer, { type Transporter } from 'nodemailer';
import { env } from '../config/env';

let transporter: Transporter | null = null;

function getTransport(): Transporter | null {
  if (!env.SMTP_HOST) return null;
  if (!transporter) {
    transporter = nodemailer.createTransport({
      host: env.SMTP_HOST,
      port: env.SMTP_PORT ?? 587,
      auth: env.SMTP_USER ? { user: env.SMTP_USER, pass: env.SMTP_PASS } : undefined,
    });
  }
  return transporter;
}

interface Mail {
  to: string;
  subject: string;
  text: string;
  html?: string;
}

/** Sends an email if SMTP is configured; otherwise logs it (dev). Never throws. */
export async function sendMail({ to, subject, text, html }: Mail): Promise<void> {
  const t = getTransport();
  if (!t) {
    // eslint-disable-next-line no-console
    console.log(`\n📧 [mailer:dev] To: ${to}\n   Subject: ${subject}\n   ${text}\n`);
    return;
  }
  try {
    await t.sendMail({ from: env.MAIL_FROM, to, subject, text, html });
  } catch (err) {
    // eslint-disable-next-line no-console
    console.error('Mail send failed:', err);
  }
}
