# Arhitectură

O singură aplicație Next.js care conține site-ul public și administrarea Payload, peste PostgreSQL.

```
Browser ──► Next.js (App Router, Node.js)
              ├─ (frontend)/ro/**, (frontend)/en/**   pagini publice, Server Components, ISR + revalidare la publicare
              ├─ (payload)/admin                      administrare Payload (autentificare obligatorie)
              ├─ (payload)/api/[...slug]              REST Payload (reguli de acces explicite; GraphQL dezactivat)
              ├─ api/contact                          POST formular → validare → antispam → rate limit → DB → email
              ├─ api/preview, api/exit-preview        preview privat (draftMode + sesiune admin)
              └─ sitemap.xml, robots.txt
            Payload Local API ──► PostgreSQL (adapter oficial, migrații versionate în src/migrations)
                              ──► media/ (disc local persistent; adaptor S3 posibil ulterior)
                              ──► SMTP (nodemailer, opțional)
```

## Module

| Cale | Responsabilitate |
|---|---|
| `src/app/(frontend)/{ro,en}/` | Rute publice. Fiecare limbă are root layout propriu (`<html lang>` corect). Fișierele de rută doar deleagă la view-uri. |
| `src/app/(payload)/` | Fișiere generate de Payload (admin, REST). Nu se editează manual. |
| `src/app/api/` | Rute proprii: contact, preview. |
| `src/cms/` | Colecții, global, reguli de acces (`access.ts`), hooks de revalidare, câmpuri comune. |
| `src/features/journal/` | Interogări publice, status editorial, preview, view-uri articol/listă. |
| `src/features/contact/` | Schemă Zod, rate limit, notificare email, handler, formular client. |
| `src/features/site/` | View-uri pentru homepage și paginile fixe. |
| `src/components/` | Componente comune (header, footer, imagini, rich text, JSON-LD). |
| `src/lib/` | i18n (rute + dicționare UI), SEO, email, utilitare. |
| `src/styles/` | Tokenuri și stiluri globale (Tailwind 4 + variabile CSS). |
| `tests/{unit,int,e2e}` | Logică pură · Payload + PostgreSQL de test · Playwright. |

## Date

| Colecție / global | Rol | Acces public |
|---|---|---|
| `admin-users` | Conturi de administrare (roluri `admin`, `editor`; primul cont devine admin) | niciunul |
| `site-settings` (global) | Identitate, contact public, social, `englishEnabled`, SEO implicit | citire |
| `pages` | Pagini fixe (`home`, `about`, `coaching`, `journal`, `contact`, `privacy`), câmpuri localizate, drafturi; homepage: despre, abordare, cifre, pași, testimoniale (cu acord) | numai `published` |
| `coaching-services` | Oferte (cu fotografie opțională); doar `confirmed` apar | numai `confirmed` |
| `articles` | Articole, un document per limbă, `translationGroup`, drafturi + versiuni, `previousSlugs` | numai `published` |
| `categories` | Denumire + slug localizate | citire |
| `article-sources` | Surse (URL, titlu, publisher, dată accesare, note) | niciunul (afișate pe server doar pentru articole publicate) |
| `media` | Fișiere cu alt text localizat, credit, drepturi | citire (imaginile cu drepturi „neverificat” nu se afișează) |
| `contact-requests` | Solicitări (fără IP brut; doar hash HMAC) | niciunul; create doar prin `/api/contact` |

Unicitate: `articles(language, slug)`; `pages(key)`. Status editorial: `docs/decisions/0003-editorial-status.md`.

## Limbi
`/` → `/ro` (307). Slugurile sunt localizate (`/ro/despre` ↔ `/en/about`) în `src/lib/i18n/routes.ts`.
Engleza răspunde 404 cât timp `site-settings.englishEnabled` este fals; o pagină EN apare doar dacă e bifată `available` pentru EN;
un articol EN este un document separat legat prin `translationGroup`. `hreflang` se emite numai între traduceri publicate.
Decizie: `docs/decisions/0002-i18n-routing.md`.

## Cache
Paginile publice sunt pre-randate și revalidate la oră (`revalidate = 3600`) și **imediat** la modificări prin hooks
(`src/cms/hooks/revalidate.ts`): publicare, retragere, ștergere de articole; orice schimbare la pagini, servicii, setări.
Testat end-to-end în `tests/e2e/editorial.spec.ts`. Build-ul de producție are nevoie de acces la baza de date.

## Securitate
- Acces: fiecare colecție are reguli explicite; interogările publice folosesc `overrideAccess: false`.
- Admin: cookies `HttpOnly`, `Secure` în producție, `SameSite=Lax`; CSRF/CORS limitate la `NEXT_PUBLIC_SITE_URL`;
  blocare după 5 încercări (15 min).
- Contact: limită 16 KB, `Content-Type` JSON, verificare `Origin`, honeypot, 3 cereri / 10 min per hash IP (în PostgreSQL,
  consecvent între instanțe). Succes = solicitare salvată; emailul eșuat se marchează și se retrimite din admin.
- Headere: `nosniff`, `Referrer-Policy`, `X-Frame-Options: SAMEORIGIN`, `Permissions-Policy`. HTTPS și HSTS la nivelul proxy-ului.
- Uploaduri: imagini (JPEG/PNG/WebP/AVIF, convertite în WebP de sharp) și clipuri scurte MP4/WebM (cu `poster` obligatoriu), max 15 MB.
  URL-urile media se fac relative (`src/lib/media.ts → mediaSrc`) pentru `next/image`.

## Puncte de extindere (fără implementare acum)
Stocare media S3-compatibilă (plugin oficial Payload), alt furnizor de email (adapter Payload), import editorial (endpoint privat),
magazin și aplicație ca module/servicii separate (`docs/ROADMAP.md`).
