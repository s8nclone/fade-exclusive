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

import { getStore, resetStoreForTests, getDrizzleDb } from "../src/server/db/client";
import { seedPostgresDatabase } from "../src/server/db/seed-postgres";

/**
 * CLI Seed Script (`pnpm db:seed`).
 * Populates both the in-memory fallback store and the connected Neon PostgreSQL database.
 */
async function main() {
  resetStoreForTests();
  const store = getStore();
  console.log("Fadé Exclusives 2026 In-Memory Mock Store initialized:");
  console.log(`   • Categories: ${store.categories.length}`);
  console.log(`   • Products: ${store.products.length}`);
  console.log(`   • Lookbooks: ${store.collections.length}`);
  console.log(`   • Promotions: ${store.promotions.length}`);
  console.log(`   • Solid Banners: ${store.banners.length}`);
  console.log(`   • Dynamic Forms: ${store.forms.length}`);
  console.log(`   • Demo Orders: ${store.orders.length}`);
  console.log(`   • Custom Fit Inquiries: ${store.customRequests.length}`);
  console.log(`   • Admin Staff Accounts: ${store.users.length}`);

  const isReset = process.argv.includes("--reset");
  const db = getDrizzleDb();
  if (db) {
    console.log(
      isReset
        ? "\nConnecting to PostgreSQL (Neon) [RESET MODE]..."
        : "\nConnecting to PostgreSQL (Neon)...",
    );
    try {
      const summary = await seedPostgresDatabase(db, { reset: isReset });
      console.log("Neon PostgreSQL database seeded successfully:");
      if (isReset) {
        console.log(
          "   • [Action] Cleared all existing table records and re-seeded from scratch.",
        );
      }
      console.log(`   • Users: ${summary.users}`);
      console.log(`   • Categories: ${summary.categories}`);
      console.log(
        `   • Products: ${summary.products} (${summary.variants} variants, ${summary.images} images)`,
      );
      console.log(
        `   • Lookbooks: ${summary.collections} (${summary.collectionItems} items)`,
      );
      console.log(`   • Solid Banners: ${summary.banners}`);
      console.log(`   • Promotions: ${summary.promotions}`);
      console.log(`   • Dynamic Forms: ${summary.forms}`);
      console.log(`   • Custom Fit Inquiries: ${summary.customRequests}`);
      console.log(`   • Demo Orders: ${summary.orders}`);
      console.log(`   • Bank Accounts: ${summary.bankAccounts}`);
      console.log(`   • Content Pages: ${summary.contentPages}`);
      console.log(`   • Global Settings: ${summary.settings}`);
      if (!isReset) {
        console.log(
          "\nTip: Run 'pnpm db:seed --reset' or 'pnpm db:reset' if you need to wipe old records and refresh initial data.",
        );
      }
    } catch (error) {
      console.error("\nFailed to seed Neon PostgreSQL database:", error);
      process.exit(1);
    }
  } else {
    console.log(
      "\n[Notice] No active PostgreSQL DATABASE_URL detected; seeded in-memory store only.",
    );
    console.log(
      "To seed your Neon database, ensure DATABASE_URL or DATABASE_URL_POOLED is set in .env.local.",
    );
  }

  process.exit(0);
}

main().catch((err) => {
  console.error("Unhandled error in seed script:", err);
  process.exit(1);
});
