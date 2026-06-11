// Shared email sending utility. Server-side only.
// Uses Resend when RESEND_API_KEY is set, falls back to SMTP (e.g. Mailcatcher in dev).
import { Resend } from "resend";
import { createTransport } from "nodemailer";

const EMAIL_FROM = process.env.EMAIL_FROM || "noreply@wijnvinder.nl";

const resend = process.env.RESEND_API_KEY
  ? new Resend(process.env.RESEND_API_KEY)
  : null;

const smtpTransport = !resend
  ? createTransport({
      host: process.env.SMTP_HOST || "localhost",
      port: Number(process.env.SMTP_PORT || 1025),
      secure: false,
    })
  : null;

export async function sendEmail({
  to,
  subject,
  html,
}: {
  to: string;
  subject: string;
  html: string;
}) {
  if (resend) {
    await resend.emails.send({ from: EMAIL_FROM, to, subject, html });
  } else {
    await smtpTransport!.sendMail({ from: EMAIL_FROM, to, subject, html });
  }
}
