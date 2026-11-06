import "server-only";
import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "./schema";
import { createInitialSeedStore, type InMemoryStore } from "./seed-data";

const globalForDb = globalThis as unknown as {
  __fadeStore?: InMemoryStore;
  __fadeSql?: ReturnType<typeof postgres>;
};

export function getStore(): InMemoryStore {
  if (!globalForDb.__fadeStore) {
    globalForDb.__fadeStore = createInitialSeedStore();
  }
  return globalForDb.__fadeStore;
}

export function resetStoreForTests(): InMemoryStore {
  globalForDb.__fadeStore = createInitialSeedStore();
  return globalForDb.__fadeStore;
}

export function getDrizzleDb() {
  const connectionString =
    process.env.DATABASE_URL_POOLED || process.env.DATABASE_URL;
  if (!connectionString || connectionString.includes("ep-example")) {
    return null;
  }
  if (!globalForDb.__fadeSql) {
    globalForDb.__fadeSql = postgres(connectionString, { prepare: false });
  }
  return drizzle(globalForDb.__fadeSql, { schema });
}
