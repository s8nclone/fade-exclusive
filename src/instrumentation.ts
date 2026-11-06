/**
 * Next.js instrumentation hook — `register()` runs once when a server instance
 * boots, before any request is handled.
 *
 * Used here to provision the initial owner admin account (from OWNER_* env
 * vars) into the in-memory store during development/testing.
 *
 * This file is compiled for both the Node.js and Edge runtimes. Node-only code
 * must stay behind the `NEXT_RUNTIME === "nodejs"` block below so the bundler
 * can drop it from the Edge build (it relies on `node:crypto`).
 */
export async function register() {
  if (process.env.NEXT_RUNTIME === "nodejs") {
    const { registerNode } = await import("./instrumentation-node");
    registerNode();
  }
}
