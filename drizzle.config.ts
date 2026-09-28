import { defineConfig } from "drizzle-kit";

/**
 * Migrations are generated and applied from a developer machine, not at
 * container start.
 *
 * Running them on boot is a common shortcut and a poor fit here: Railway can
 * have the old and new container alive at once during a deploy, so two processes
 * would race to migrate, and a failed migration would turn into a crash loop
 * with a failing healthcheck rather than a readable error. With one table and a
 * two-person team, `npm run db:migrate` against the public proxy URL is both
 * safer and easier to reason about.
 */
export default defineConfig({
  schema: "./src/db/schema.ts",
  out: "./drizzle",
  dialect: "postgresql",
  dbCredentials: {
    // Deliberately not defaulted: pointing a migration at the wrong database is
    // a bad way to find out the variable was missing.
    url: process.env.DATABASE_URL!,
  },
  strict: true,
  verbose: true,
});
