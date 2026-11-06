import { getStore } from "../src/server/db/client";

/**
 * CLI Orphan Media Cleanup Script (`pnpm media:cleanup-orphans`).
 * Scans media assets older than 24h that are not referenced by any product,
 * collection, or press item.
 */
function main() {
  const store = getStore();
  const cutoff = Date.now() - 24 * 3600 * 1000;

  const referencedUrls = new Set<string>();
  for (const prod of store.products) {
    for (const img of prod.images) referencedUrls.add(img.url);
  }
  for (const col of store.collections) {
    referencedUrls.add(col.coverUrl);
  }
  for (const p of store.pressItems) {
    referencedUrls.add(p.coverUrl);
  }

  const before = store.mediaAssets.length;
  store.mediaAssets = store.mediaAssets.filter((asset) => {
    const createdMs = new Date(asset.createdAt).getTime();
    if (createdMs > cutoff) return true;
    return referencedUrls.has(asset.url);
  });

  const removed = before - store.mediaAssets.length;
  console.log(`Cleaned up ${removed} orphan media asset(s).`);
}

main();
