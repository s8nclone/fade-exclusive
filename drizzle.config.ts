import { defineConfig } from "drizzle-kit";
import fs from "node:fs";
import process from "node:process";

// Automatically load environment variables from .env.local (standard in Next.js)
if (typeof process.loadEnvFile === "function") {
  if (fs.existsSync(".env.local")) {
    process.loadEnvFile(".env.local");
  } else if (fs.existsSync(".env")) {
    process.loadEnvFile(".env");
  }
}

const dbUrl =
  process.env.DATABASE_URL_UNPOOLED ||
  process.env.DATABASE_URL ||
  process.env.DATABASE_URL_POOLED;

if (!dbUrl) {
  throw new Error(
    "Missing database connection string. Please set DATABASE_URL_UNPOOLED or DATABASE_URL in your .env.local file.",
  );
}

export default defineConfig({
  schema: "./src/server/db/schema/index.ts",
  out: "./drizzle",
  dialect: "postgresql",
  dbCredentials: {
    url: dbUrl,
  },
  strict: true,
  verbose: true,
});
