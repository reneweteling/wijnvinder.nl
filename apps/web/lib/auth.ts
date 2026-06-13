import { betterAuth } from "better-auth";
import { nextCookies } from "better-auth/next-js";
import { headers } from "next/headers";
import { pool, db } from "@/lib/db/client";
import { sendEmail } from "@/lib/email";
import { env } from "@/lib/env";

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
  baseURL: env.BETTER_AUTH_BASE_URL,
  secret: env.BETTER_AUTH_SECRET,
  database: pool,
  user: {
    additionalFields: {
      role: { type: "string", input: false },
    },
  },
  rateLimit: {
    enabled: true,
    window: 60,
    max: 10,
  },
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
  socialProviders: {
    google: {
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    },
    microsoft: {
      clientId: process.env.MICROSOFT_CLIENT_ID!,
      clientSecret: process.env.MICROSOFT_CLIENT_SECRET!,
      tenantId: "common",
    },
  },
  account: {
    accountLinking: {
      enabled: true,
      trustedProviders: ["google", "microsoft"],
      // Link OAuth sign-ins onto a local account even when its email is not
      // verified yet. Google and Microsoft only hand out verified emails, so
      // the sign-in itself proves ownership; better-auth then marks the local
      // email as verified on link.
      requireLocalEmailVerified: false,
    },
  },
  databaseHooks: {
    session: {
      create: {
        after: async (session) => {
          try {
            await db.user.update({
              where: { id: session.userId },
              data: { lastLoginAt: new Date() },
            });
          } catch {
            // Never block login on a hook failure
          }
        },
      },
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
