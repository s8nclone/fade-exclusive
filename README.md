# Fadé Exclusives — Storefront, Brand Portfolio 2026 & Atelier Admin

> **African luxury. Contemporary expression. Commercial opportunity.**
> Flagship digital commerce platform, interactive **2026 Brand & Growth Portfolio**, and operations command center for **Fadé Exclusives** (Abuja, Nigeria).

---
---

## 1. Quickstart

```bash
# 1. Install dependencies
pnpm install

# 2. Seed demo data (also auto-seeded in memory for zero-config dev/test)
pnpm db:seed

# 3. Start development server
pnpm dev
```
---

## 2. Verification Scripts

| Command | Description |
| --- | --- |
| `pnpm test` | Run Vitest unit & domain integration suite (`pricing`, `orders`, `contrast`, `phone`, `whatsapp`, `forms`, `mappers`) |
| `pnpm check:no-gradients` | Scan `src/**` to guarantee zero occurrences of CSS/SVG color blends |
| `pnpm lint` | Run ESLint (including atomic UI import boundary rules) + no-gradients check |
| `pnpm typecheck` | Run TypeScript `tsc --noEmit` strict check |
| `pnpm build` | Build production Next.js 15 App Router bundle |
| `pnpm test:e2e` | Run Playwright E2E suite |

