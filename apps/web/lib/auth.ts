import { betterAuth } from "better-auth";
import { nextCookies } from "better-auth/next-js";
import { headers } from "next/headers";
import { Resend } from "resend";
import { createTransport } from "nodemailer";
import { pool } from "@/lib/db/client";

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

async function sendEmail({ to, subject, html }: { to: string; subject: string; html: string }) {
  if (resend) {
    await resend.emails.send({ from: EMAIL_FROM, to, subject, html });
  } else {
    await smtpTransport!.sendMail({ from: EMAIL_FROM, to, subject, html });
  }
}

function emailLayout({ greeting, body, buttonUrl, buttonLabel, footnote }: {
  greeting: string;
  body: string;
  buttonUrl: string;
  buttonLabel: string;
  footnote?: string;
}) {
  return `<!DOCTYPE html>
<html lang="nl">
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1.0"></head>
<body style="margin:0;padding:0;background-color:#f8f5f0;font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:#f8f5f0;padding:40px 20px;">
    <tr><td align="center">
      <table role="presentation" width="560" cellpadding="0" cellspacing="0" style="max-width:560px;width:100%;">
        <!-- Header -->
        <tr><td style="text-align:center;padding:0 0 32px;">
          <span style="font-size:28px;font-weight:700;color:#722f37;letter-spacing:-0.5px;">WijnVinder</span>
        </td></tr>
        <!-- Card -->
        <tr><td style="background-color:#ffffff;border-radius:12px;padding:40px 36px;box-shadow:0 1px 3px rgba(0,0,0,0.08);">
          <p style="margin:0 0 8px;font-size:20px;font-weight:600;color:#1a1a1a;">${greeting}</p>
          <p style="margin:0 0 28px;font-size:15px;line-height:1.6;color:#4a4a4a;">${body}</p>
          <table role="presentation" cellpadding="0" cellspacing="0" style="margin:0 auto;">
            <tr><td style="background-color:#722f37;border-radius:8px;">
              <a href="${buttonUrl}" target="_blank" style="display:inline-block;padding:14px 32px;font-size:15px;font-weight:600;color:#ffffff;text-decoration:none;">${buttonLabel}</a>
            </td></tr>
          </table>
          ${footnote ? `<p style="margin:28px 0 0;font-size:13px;line-height:1.5;color:#999999;">${footnote}</p>` : ''}
        </td></tr>
        <!-- Footer -->
        <tr><td style="text-align:center;padding:28px 0 0;">
          <p style="margin:0;font-size:12px;color:#999999;">WijnVinder &mdash; Vind jouw perfecte wijn</p>
        </td></tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`;
}

export const auth = betterAuth({
  baseURL: process.env.BETTER_AUTH_BASE_URL,
  secret: process.env.BETTER_AUTH_SECRET,
  database: pool,
  emailAndPassword: {
    enabled: true,
    sendResetPassword: async ({ user, url }) => {
      await sendEmail({
        to: user.email,
        subject: "Wachtwoord resetten - WijnVinder",
        html: emailLayout({
          greeting: `Hoi ${user.name || "daar"}`,
          body: "Je hebt een verzoek ingediend om je wachtwoord te resetten. Klik op de knop hieronder om een nieuw wachtwoord in te stellen.",
          buttonUrl: url,
          buttonLabel: "Wachtwoord resetten",
          footnote: "Heb je dit niet aangevraagd? Dan kun je deze e-mail veilig negeren.",
        }),
      });
    },
  },
  emailVerification: {
    sendOnSignUp: true,
    sendVerificationEmail: async ({ user, url }) => {
      await sendEmail({
        to: user.email,
        subject: "Bevestig je e-mailadres - WijnVinder",
        html: emailLayout({
          greeting: `Welkom ${user.name || ""}!`,
          body: "Leuk dat je er bent! Bevestig je e-mailadres om je account te activeren en direct gepersonaliseerde wijnaanbevelingen te ontvangen.",
          buttonUrl: url,
          buttonLabel: "E-mailadres bevestigen",
          footnote: "Als je je niet hebt aangemeld bij WijnVinder, kun je deze e-mail negeren.",
        }),
      });
    },
  },
  plugins: [nextCookies()],
});

/**
 * Get the authenticated session for server components / actions.
 */
export async function getServerAuthSession() {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session?.user) {
    return null;
  }
  return session;
}
