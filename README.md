# Fadé Exclusives — Storefront, Brand Portfolio 2026 & Atelier Admin

> **African luxury. Contemporary expression. Commercial opportunity.**
> Flagship digital commerce platform, interactive **2026 Brand & Growth Portfolio**, and hidden operations command center for **Fadé Exclusives** (Maitama, Abuja, Nigeria).

---

## 1. Highlights & Non-Negotiable Architecture

- **Package Manager:** `pnpm` only (`packageManager: "pnpm@12.14.0"`).
- **Mobile-First & 100% Solid Luxury Color Palette:** Zero CSS or SVG color blends (`scripts/check-no-gradients.mjs` enforces zero occurrences in `src/**`). Built on Warm Alabaster (`#F4F1EA`), Deep Obsidian (`#161412`), Heritage Bronze (`#9E7344`), and Warm Stone (`#EAE4D8`).
- **Brand Assets & 2026 Portfolio Integration:**
  - Official **Fadé Exclusive** geometric monogram and lockup logos (`public/brand/logo-mark.jpg`, `public/brand/logo-full.jpg`, `public/brand/logo-mark.svg`).
  - Full 8-page **"FADÉ EXCLUSIVES — BRAND & GROWTH PORTFOLIO 2026"** editorial experience rendered on `/about` (`src/components/modules/PortfolioShowcase.tsx`) and woven into the storefront catalog (`The Agbada`, `The Modern Set`, `The Fila`, `The Kaftan`, `Contemporary`).
- **Strict Atomic UI + Smart Containers:**
  - Dumb presentation hierarchy: `src/components/ui` → `atoms` → `molecules` → `modules` → `templates` (enforced by ESLint `no-restricted-imports`).
  - Smart containers in `src/containers/**` connect TanStack Query hooks and Zustand stores (`cart.store.ts`, `ui.store.ts`) to modules.
- **Feature Services Pattern (`src/services/<feature>/`):**
  - Every domain (`products`, `collections`, `cart`, `checkout`, `orders`, `promotions`, `banners`, `forms`, `custom-requests`, `content`, `settings`, `auth`, `users`, `media`, `audit`, `dashboard`) encapsulates its `.schema.ts`, `.types.ts`, `.service.ts`, and `.hooks.ts`.
  - Client services use the shared Axios instance (`src/lib/http/axios.ts`); server reads use the native `fetch` wrapper (`src/lib/http/fetch.server.ts`).
- **Hidden Admin Command Center (`/[adminSlug]/...`):**
  - Guarded by constant-time comparison against server-only `ADMIN_PATH_SLUG` (defaults to `atelier-ops-dev` in development).
  - Returns a standard `404` on any non-matching slug; emits `X-Robots-Tag: noindex, nofollow`; never linked from any public page, `robots.txt`, or `sitemap.xml`.
- **Direct Bank Transfer + WhatsApp Receipt + Official Printable Receipt:**
  - Server-authoritative pricing engine (`src/server/domain/pricing/pricing.domain.ts`) with integer minor units (`kobo`), automatic sales, coupon codes, and 50% Made-to-Order deposits.
  - Unambiguous transfer reference code (`FD-XXXXXX`), 48-hour stock reservation window, pre-filled `wa.me` deep link, anti-fraud admin confirmation modal, and printable receipt at `/receipt/[token]`.

---

## 2. Quickstart

```bash
# 1. Install dependencies
pnpm install

# 2. Seed demo data (also auto-seeded in memory for zero-config dev/test)
pnpm db:seed

# 3. Start development server
pnpm dev
```

### Default Hidden Admin Access (Development)
- **URL:** `http://localhost:3000/<ADMIN_PATH_SLUG>/login`
- **Owner:** created at server startup from `OWNER_EMAIL` / `OWNER_PASSWORD` in `.env.local` (see `src/instrumentation.ts`). Restart `pnpm dev` after changing them.
- **Manager (seeded):** `manager@fadeexclusive.com` / `FadeAtelierManager2026!`

---

## 3. Verification Scripts

| Command | Description |
| --- | --- |
| `pnpm test` | Run Vitest unit & domain integration suite (`pricing`, `orders`, `contrast`, `phone`, `whatsapp`, `forms`, `mappers`) |
| `pnpm check:no-gradients` | Scan `src/**` to guarantee zero occurrences of CSS/SVG color blends |
| `pnpm lint` | Run ESLint (including atomic UI import boundary rules) + no-gradients check |
| `pnpm typecheck` | Run TypeScript `tsc --noEmit` strict check |
| `pnpm build` | Build production Next.js 15 App Router bundle |
| `pnpm test:e2e` | Run Playwright E2E suite |

---

## 4. Documentation Index

- [`docs/PLAN.md`](./docs/PLAN.md) — Implementation plan & route matrix
- [`docs/ASSUMPTIONS.md`](./docs/ASSUMPTIONS.md) — Explicit defaults & product decisions
- [`docs/ARCHITECTURE.md`](./docs/ARCHITECTURE.md) — Layering, state split, and data flow
- [`docs/SECURITY.md`](./docs/SECURITY.md) — Threat model, RBAC, and anti-fraud controls
- [`docs/RUNBOOK.md`](./docs/RUNBOOK.md) — Operations runbook (rotating `ADMIN_PATH_SLUG`, bank verification, cron)
