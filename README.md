# Daniel Popescu — website și jurnal de tenis

Website personal (RO implicit, EN opțional) cu jurnal, administrare editorială și formular de contact funcțional.
Cod, bază de date și media sub controlul proprietarului; găzduire portabilă (Node.js + PostgreSQL, Docker opțional).

**Stare curentă:** vezi [`docs/PROJECT_STATE.md`](docs/PROJECT_STATE.md). **Reguli de lucru:** [`AGENTS.md`](AGENTS.md).

## Stack

Next.js 16 (App Router) · React 19 · TypeScript strict · Tailwind CSS 4 · Payload CMS 3 · PostgreSQL 16 · Zod · Vitest · Playwright.
Versiunile exacte sunt fixate în `package.json` / `pnpm-lock.yaml`. Motivele: [`docs/decisions/0001-stack.md`](docs/decisions/0001-stack.md).

## Pornire locală

Cerințe: Node.js ≥ 22.23.4, pnpm 10 (`corepack enable`), PostgreSQL 16.

```bash
pnpm install
cp .env.example .env        # completează DATABASE_URL, PAYLOAD_SECRET, CONTACT_HASH_SECRET
pnpm migrate                # aplică migrațiile
pnpm seed:dev               # opțional: date locale marcate [EXEMPLU] + cont admin din .env
pnpm dev                    # http://localhost:3000/ro · administrare: /admin
```

Detalii (crearea bazei de date, email, media, backup, Docker): [`docs/RUNBOOK.md`](docs/RUNBOOK.md).

## Comenzi

| Comandă | Ce face |
|---|---|
| `pnpm dev` / `pnpm build` / `pnpm start` | dezvoltare / build de producție / server de producție |
| `pnpm lint` · `pnpm typecheck` | ESLint · TypeScript |
| `pnpm test:unit` | logică pură (fără bază de date) |
| `pnpm test:int` | Payload + PostgreSQL de test (`TEST_DATABASE_URL`) |
| `pnpm test:e2e` | Playwright pe serverul de producție local (desktop + mobil) |
| `pnpm migrate:create <nume>` · `pnpm migrate` | migrații de schemă |
| `node scripts/contrast.mjs` | verifică contrastul paletei |
| `scripts/backup.sh` · `scripts/restore.sh` | backup / restaurare bază + media |

## Documentație

`docs/PROJECT_BRIEF.md` (scop) · `docs/ROADMAP.md` (etape) · `docs/ARCHITECTURE.md` · `docs/DESIGN_SYSTEM.md` ·
`docs/EDITORIAL_GUIDE.md` · `docs/WORKFLOW.md` · `docs/RUNBOOK.md` · `docs/TOOLS.md` · `docs/decisions/` · `docs/reports/`.
