import { ZenStackClient } from "@zenstackhq/orm";
import { PostgresDialect } from "@zenstackhq/orm/dialects/postgres";
import { PolicyPlugin } from "@zenstackhq/plugin-policy";
import { schema } from "@/lib/db/schema";
import { User } from "@/lib/db/models";
import { Pool } from "pg";

const globalForDb = globalThis as unknown as {
  db: ReturnType<typeof dbClientSingleton> | undefined;
  authDb: ReturnType<typeof authDbClientSingleton> | undefined;
};

const connectionString = process.env.DATABASE_URL || "";

const sslConfig = connectionString.includes("localhost")
  ? {}
  : {
      ssl: {
        rejectUnauthorized: false,
      },
    };

export const pool = new Pool({
  connectionString,
  ...sslConfig,
});

const dbClientSingleton = () => {
  const client = new ZenStackClient(schema, {
    dialect: new PostgresDialect({
      pool,
    }),
    log:
      process.env.NODE_ENV === "development"
        ? [
            ...(process.env.SHOW_QUERY_LOG === "true"
              ? ["query" as const]
              : []),
            "error",
          ]
        : ["error"],
  });

  return client;
};

const authDbClientSingleton = () => {
  return db.$use(new PolicyPlugin());
};

let db: ReturnType<typeof dbClientSingleton>;
let authDbInstance: ReturnType<typeof authDbClientSingleton>;

if (process.env.NODE_ENV === "development") {
  db = dbClientSingleton();
  authDbInstance = authDbClientSingleton();
} else {
  db = globalForDb.db ?? dbClientSingleton();
  authDbInstance = globalForDb.authDb ?? authDbClientSingleton();
}

export { db, authDbInstance };

/**
 * Create an authenticated database client with a user context.
 * Applies ZenStack access control policies based on the user.
 */
export const authDb = (user: User) => {
  return authDbInstance.$setAuth(user as User);
};
