# Starea proiectului

**Actualizat:** 10.11.2026 · **Etapa activă:** Etapa 1 — Website și jurnal (parțială)
**Branch / commit de cod verificat:** `claude/jolly-galileo-04v2nq` @ commitul „Design v5” (paleta „apus pe teren”)
**Modificări locale necomise:** niciuna după commitul acestui fișier.

## Finalizat (cu dovezi)
Verificările de mai jos au rulat **local** pe `11052f8` și din nou pe design v5 (lint, typecheck, contrast, unit 14/14, int 14/14, build, e2e 16 trecute + 2 omise intenționat) (Ubuntu 24.04, Node 22.23.4, PostgreSQL 16.15). CI pe GitHub: încă nerulat.

- [x] Fundație tehnică: Next.js 16.3.8 + Payload 3.92.0 + PostgreSQL; migrația inițială rulează pe o bază curată (`pnpm migrate`).
- [x] Pagini RO: homepage (6 secțiuni, afișate doar cu conținut real), despre, antrenamente, jurnal, articol, contact, confidențialitate.
- [x] EN: rute echivalente, 404 până la `englishEnabled`; hreflang doar pentru traduceri publicate.
- [x] Jurnal: drafturi, versiuni, preview privat, status editorial derivat (decizia 0003), redirect la schimbarea slugului.
- [x] Acces: drafturile, modificările nepublicate, sursele, solicitările și adminii nu sunt publici — `tests/int/articles-access.test.ts`, `tests/e2e/editorial.spec.ts`.
- [x] Cache: publicarea și retragerea unui articol actualizează pagina și lista (e2e).
- [x] Contact: salvare înaintea emailului, validare, honeypot, limită de mărime/origine, rate limit în DB — `tests/int/contact.test.ts` + e2e UI.
- [x] Design v5 (decizii 0007 + 0008 + 0009 — paleta „apus pe teren”: portocaliu `#F26A3D`, ardezie `#1C2633`, albastru prăfuit, după imaginea de referință a lui Daniel): structură editorial-sportivă după capturile trimise de Daniel, fundal albicios, hero 3D din CSS; contrast verificat (`scripts/contrast.mjs`), fonturi locale (Archivo Expanded, Source Sans 3) cu diacritice verificate.
- [x] CMS homepage: cifre confirmate, testimoniale doar cu acord, titluri-afirmație; antrenamente cu fotografie opțională (migrația `20261110_103117`).
- [x] SEO tehnic: metadata per pagină, canonical, sitemap, robots (`Disallow: /` în afara producției), Open Graph, JSON-LD.
- [x] Backup + restaurare testate local (`docs/RUNBOOK.md`).
- [x] Rezultate: lint ✓ · typecheck ✓ · contrast ✓ · unit 14/14 ✓ · integrare 14/14 ✓ · build ✓ · e2e 16 trecute, 2 omise intenționat (desktop + mobil; axe fără încălcări serioase/critice pe 4 pagini; fără scroll orizontal; meniul mobil verificat pe ecran).

## În lucru / urmează
| Issue | Stare |
|---|---|
| [#1 Validare direcție vizuală v2](https://github.com/popescualexandrudd-cell/TENNIS-DEVELOPMENT/issues/1) | așteaptă Daniel |
| [#2 Conținut real](https://github.com/popescualexandrudd-cell/TENNIS-DEVELOPMENT/issues/2) | BLOCAT — informații de la Daniel |
| [#3 Informare de confidențialitate](https://github.com/popescualexandrudd-cell/TENNIS-DEVELOPMENT/issues/3) | BLOCAT — operator + furnizori |
| [#4 Găzduire, domeniu, staging, SMTP](https://github.com/popescualexandrudd-cell/TENNIS-DEVELOPMENT/issues/4) | BLOCAT — decizie + costuri |
| [#5 Lighthouse mobil](https://github.com/popescualexandrudd-cell/TENNIS-DEVELOPMENT/issues/5) | după fotografii reale |
| [#6 Analytics](https://github.com/popescualexandrudd-cell/TENNIS-DEVELOPMENT/issues/6) | decizie Daniel |
| [#7 GitHub: milestones, protecție, CI](https://github.com/popescualexandrudd-cell/TENNIS-DEVELOPMENT/issues/7) | gata de început |

PR: vezi lista de PR-uri a repository-ului (branch `claude/jolly-galileo-04v2nq`).

## Nerulat / neverificat
- Imaginea Docker și `docker-compose.yml` (fără daemon Docker în mediu).
- Trimiterea reală de email (fără SMTP).
- Lighthouse / Core Web Vitals (fără conținut și fotografii reale nu ar fi reprezentative).
- Site-urile de referință (DNS blocat în mediu) — nimic preluat din ele.
- Formatul skillurilor `.claude/skills/*` față de documentația online (urmează formatul skillurilor disponibile în mediu).

## Informații lipsă (marcaje interne — nu apar pe site)
Cifre reale pentru „Pe scurt” și testimoniale cu acord scris (opționale) · Bio și ce experiență poate fi menționată · oferte confirmate · locație publică · email/telefon/social · fotografii și drepturi ·
validarea textelor din hero și „Cum lucrez” · operatorul datelor · domeniu, gazdă, SMTP · analytics da/nu.

## Următoarea acțiune concretă
1. Daniel: răspunde la întrebările din #1 și #2 (se pot introduce direct în /admin sau trimise ca text).
2. Agent: #7 (verifică prima rulare CI pe PR), apoi introducerea conținutului real primit, apoi #5.

## Predare
- Obiectiv activ: Etapa 1 — validarea designului și conținutul real.
- Stare actuală: fundație + site + fluxuri verificate local; conținut real lipsă.
- Branch / commit verificat: `claude/jolly-galileo-04v2nq` @ `11052f8`.
- Modificări locale: niciuna.
- Fișiere relevante: `src/features/site/HomeView.tsx`, `src/features/site/HeroStage.tsx`, `src/styles/globals.css`, `src/cms/collections/*`, `docs/DESIGN_SYSTEM.md`.
- Verificări efectuate: vezi „Finalizat”.
- Probleme rămase: vezi „Nerulat” și issues blocate.
- Următoarea acțiune: vezi mai sus.
- Necesită acces sau decizie: Daniel (conținut, design, operator, costuri); GitHub settings (milestones, protecție branch).
