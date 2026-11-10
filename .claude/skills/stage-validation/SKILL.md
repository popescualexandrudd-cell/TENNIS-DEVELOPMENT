---
name: stage-validation
description: Verifică poarta etapei active din docs/ROADMAP.md și scrie raportul de etapă în docs/reports/. Folosește-l înainte de a declara o etapă încheiată.
---

# Validarea unei etape

## Citește
`docs/ROADMAP.md` (poarta etapei), `docs/PROJECT_STATE.md`, criteriile obligatorii din `docs/WORKFLOW.md`.

## Pași
1. Notează commitul verificat (`git rev-parse --short HEAD`); orice modificare ulterioară invalidează rezultatele.
2. Rulează: `pnpm lint`, `pnpm typecheck`, `node scripts/contrast.mjs`, `pnpm test:unit`, `pnpm test:int`, `pnpm build`, `pnpm test:e2e`.
3. Capturi desktop (1440) și mobil (iPhone 13) pentru paginile modificate.
4. Dacă e disponibil: Lighthouse mobil pe `/ro`, un articol și `/ro/contact` (raportează condițiile: local, throttling, build).
5. Completează checklistul etapei cu `[x]`, `[ ]`, `BLOCAT (motiv, condiție)`, `N/A (motiv)`; separă „local” / „CI” / „staging” / „producție”.

## Livrabil
`docs/reports/<AAAA-LL-ZZ>-<etapa>.md`: obiectiv, livrat, checklist, verificări + rezultate, dovezi (commit, PR, CI, capturi),
probleme deschise, decizii, costuri/servicii, următorul pas. Actualizează `docs/PROJECT_STATE.md`.

## Nu este autorizat
Să inventeze rezultate sau scoruri; să marcheze o etapă validată cu blocaj critic, teste eșuate, funcționare simulată,
serviciu extern neconfigurat sau conținut demonstrativ publicat.
