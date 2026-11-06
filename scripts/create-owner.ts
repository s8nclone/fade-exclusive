/**
 * `pnpm owner:create`
 *
 * While the app runs on the in-memory store (no Postgres connected), the owner
 * account lives inside the Next.js server process, so a separate CLI process
 * cannot create it. Instead, the owner is provisioned automatically at server
 * startup from OWNER_EMAIL / OWNER_PASSWORD / OWNER_NAME
 * (see src/instrumentation.ts and src/server/bootstrap/owner.ts).
 *
 * Once Postgres is connected, this script should write the owner to the
 * database (run with `tsx --conditions=react-server --env-file=.env.local`).
 */
const lines = [
  "",
  "The owner account is created automatically when the server starts.",
  "",
  "  1. Set these in .env.local:",
  '       OWNER_EMAIL="you@example.com"',
  '       OWNER_PASSWORD="at-least-12-characters"',
  '       OWNER_NAME="Your Name"',
  "  2. Start (or restart) the server:  pnpm dev",
  '  3. Look for "[bootstrap] Owner account created" in the server log,',
  "     then sign in at /<ADMIN_PATH_SLUG>/login",
  "",
];

console.log(lines.join("\n"));
