# Rawnak Official Website

Next.js App Router + Tailwind + Supabase project for RAWNAK / رونق.

## Core Stack

- Next.js App Router
- Tailwind CSS
- `next-intl` (Arabic/English routes: `/ar`, `/en`)
- `next-themes` (light/dark)
- Supabase Auth + Postgres + RLS

## Environment Variables

Create `.env.local` from `env.example`:

```bash
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
```

Security:
- `SUPABASE_SERVICE_ROLE_KEY` is server-only.
- Do not expose `SUPABASE_SERVICE_ROLE_KEY` to the browser.

## Database Migrations

Run in Supabase SQL Editor (in order):

1. `supabase/migrations/20260220_000001_rbac_content.sql`
2. `supabase/migrations/20260221_000002_owner_builder.sql`
3. `supabase/migrations/20260221_000003_visual_builder_upgrade.sql`
4. `supabase/migrations/20260222_000004_analytics.sql`
5. `supabase/migrations/20260222_000005_admin_console_modules.sql`

## Bootstrap First Owner

1. Sign up/login once so your user exists in `auth.users`.
2. Open `supabase/sql/bootstrap_owner.sql`.
3. Replace `<REAL_OWNER_USER_ID>` with your real user UUID from `auth.users`.
4. Run the SQL once.

After this, that account is the only account with `owner` role until you explicitly grant roles.

## Owner Dashboard Routes

Owner-only builder and site management routes:

- `/{locale}/admin` (module hub)
- `/{locale}/admin/dashboard`
- `/{locale}/admin/content`
- `/{locale}/admin/crm`
- `/{locale}/admin/team`
- `/{locale}/admin/ops`
- `/{locale}/admin/inventory`
- `/{locale}/admin/finance`
- `/{locale}/admin/reports`
- `/{locale}/admin/pages`
- `/{locale}/admin/builder/[pageId]`
- `/{locale}/admin/templates`
- `/{locale}/admin/theme`
- `/{locale}/admin/media`
- `/{locale}/admin/audit`
- `/{locale}/admin/settings`
- `/{locale}/admin/settings/security`
- `/{locale}/admin/settings/integrations`
- `/{locale}/admin/customers`
- `/{locale}/admin/leads`
- `/{locale}/admin/inventory/items`
- `/{locale}/admin/inventory/moves`
- `/{locale}/admin/inventory/ledger`
- `/{locale}/admin/finance/invoices`
- `/{locale}/admin/finance/payments`
- `/{locale}/admin/finance/expenses`
- `/{locale}/admin/finance/cashflow`
- `/{locale}/admin/finance/pl`
- `/{locale}/admin/reports/*`
- `/{locale}/preview/[slug]`

Public rendering for published builder pages:

- `/{locale}/{slug}` (dynamic published pages)
- `/{locale}/p/{slug}` (published page route)

## Data Import (Owner Only)

Open:

- `/{locale}/admin/settings/integrations`

Supported file formats:

- `.csv`
- `.xlsx` / `.xls`
- `.json` (array of objects)

Supported targets:

- `services`, `products`, `kits`, `portfolio_items`
- `inventory_items`
- `customers`
- `leads_requests`

Required columns:

- Content tables: `slug`, `title_ar`, `title_en`
- Inventory: optional `sku`, `name_ar`, `name_en`
- Customers: optional `name`, `user_id`
- Leads: optional `customer_id`, `name`, `channel`, `status`

Use `Dry run` first to validate rows before writing.

## Builder Animation System (Owner Only)

- Animation configuration is stored per block in `blocks_json` with a normalized schema.
- Validation is enforced in `lib/builder/animation/schema.ts` (Zod + strict ranges + allowlists).
- Preset registry is centralized in `lib/builder/animation/presets.ts`.
- Rendering is handled in `components/builder/BlockRenderer.tsx`:
  - Framer Motion presets
  - Anime.js allowlisted presets (no raw selectors/code from DB)
  - Lottie block playback from owner media
- Builder live preview includes:
  - Per-block `Test animation`
  - Global `Preview animations ON/OFF`
  - Device preview support (desktop/tablet/mobile)
- `prefers-reduced-motion` is respected in preview and public rendering.

### Add A New Animation Preset Safely

1. Add preset metadata to `lib/builder/animation/presets.ts`:
   - `id`, `engine`, `supportedTriggers`, and `defaults`.
2. Add renderer logic (Framer/Anime allowlisted behavior only):
   - `lib/builder/animation/runtime.ts`
3. Add localized labels:
   - `messages/en.json`
   - `messages/ar.json`
4. Run checks:
   - `pnpm lint`
   - `pnpm build`

Do not store arbitrary JS/CSS in the database. Only structured settings are allowed.

## Services Stage (Two-Axis Experience)

The public `/{locale}/services` route now uses a dedicated full-stage experience with:

- Horizontal scene switching across the 4 service domains.
- Vertical step progression (Hero, Deliverables, Process, CTA) per scene.
- Keyboard support:
  - `Left` / `Right` for service scenes
  - `Up` / `Down` for vertical steps
- Touch support:
  - Horizontal swipe for scene switching
  - Vertical swipe for step switching
- Reduced-motion support via `prefers-reduced-motion`.

### Edit Services Copy

Update:

- `components/services/services-content.ts`

This file contains all AR/EN structured copy for:

- Scene title/subtitle
- Hero text
- Deliverables
- Process steps
- CTA labels/links
- Scene color presets

No business metrics or fabricated facts should be added.

### Tune Background Presets and Legibility

Adjust:

- `components/services/ParallaxBackground.tsx` for layer composition and cinematic progression.
- `components/services/AdaptiveTextColor.tsx` for luminance thresholds and hysteresis.

Legibility uses an adaptive luminance model plus a glass panel so text remains readable while colors evolve through vertical progress.

## Access Control Model

- Builder features are owner-only at:
  - Route level (server guards)
  - Server actions
  - Database level (RLS owner-only policies)
- Public pages read only published builder pages through secure SQL functions.
- No demo business content is seeded.

## Local Development

```bash
pnpm install
pnpm build
pnpm dev
```

If you use npm:

```bash
npm install
npm run build
npm run dev
```
