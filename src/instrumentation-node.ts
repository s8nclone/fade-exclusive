import { ensureOwnerAccount } from "@/server/bootstrap/owner";

/**
 * Node.js-only startup work, loaded from `src/instrumentation.ts`.
 */
export function registerNode() {
  const result = ensureOwnerAccount();

  switch (result.status) {
    case "created":
      console.info(`[bootstrap] Owner account created: ${result.email}`);
      break;
    case "updated":
      console.info(`[bootstrap] Owner account updated from env: ${result.email}`);
      break;
    case "unchanged":
      console.info(`[bootstrap] Owner account ready: ${result.email}`);
      break;
    case "skipped":
      console.warn(`[bootstrap] No owner account provisioned. ${result.reason}`);
      break;
  }
}
