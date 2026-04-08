import { betterAuth } from "better-auth";
import { nextCookies } from "better-auth/next-js";
import { headers } from "next/headers";
import { createTransport } from "nodemailer";
import { pool } from "@/lib/db/client";

const smtpTransport = createTransport({
  host: process.env.SMTP_HOST || "localhost",
  port: Number(process.env.SMTP_PORT || 1025),
  secure: false,
});

export const auth = betterAuth({
  baseURL: process.env.BETTER_AUTH_BASE_URL,
  secret: process.env.BETTER_AUTH_SECRET,
  database: pool,
  emailAndPassword: {
    enabled: true,
    sendResetPassword: async ({ user, url }) => {
      await smtpTransport.sendMail({
        from: process.env.EMAIL_FROM || "noreply@wijnvinder.nl",
        to: user.email,
        subject: "Wachtwoord resetten - WijnVinder",
        html: `<p>Hoi ${user.name || ""},</p><p>Klik <a href="${url}">hier</a> om je wachtwoord te resetten.</p>`,
      });
    },
  },
  emailVerification: {
    sendOnSignUp: true,
    sendVerificationEmail: async ({ user, url }) => {
      await smtpTransport.sendMail({
        from: process.env.EMAIL_FROM || "noreply@wijnvinder.nl",
        to: user.email,
        subject: "Bevestig je e-mailadres - WijnVinder",
        html: `<p>Hoi ${user.name || ""},</p><p>Klik <a href="${url}">hier</a> om je e-mailadres te bevestigen.</p>`,
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
