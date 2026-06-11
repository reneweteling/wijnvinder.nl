// Validated environment variables. Server-side only — do NOT import from client components.
import { z } from "zod";

const envSchema = z.object({
  // Required
  DATABASE_URL: z.string().min(1),
  BETTER_AUTH_SECRET: z.string().min(1),

  // Optional auth
  BETTER_AUTH_BASE_URL: z.string().url().optional(),
  GOOGLE_CLIENT_ID: z.string().optional(),
  GOOGLE_CLIENT_SECRET: z.string().optional(),
  MICROSOFT_CLIENT_ID: z.string().optional(),
  MICROSOFT_CLIENT_SECRET: z.string().optional(),

  // Optional email
  RESEND_API_KEY: z.string().optional(),
  EMAIL_FROM: z.string().optional(),
  SMTP_HOST: z.string().optional(),
  SMTP_PORT: z.string().optional(),

  // Optional app
  ADMIN_EMAILS: z.string().optional(),
});

const _parsed = envSchema.safeParse(process.env);

if (!_parsed.success) {
  const missing = _parsed.error.issues
    .map((i) => i.path.join("."))
    .join(", ");
  throw new Error(`Missing or invalid environment variables: ${missing}`);
}

export const env = _parsed.data;
