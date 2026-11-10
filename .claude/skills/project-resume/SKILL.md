---
name: project-resume
description: Reface contextul proiectului daniel-popescu-web la începutul unei sesiuni și alege următoarea sarcină. Folosește-l când reiei lucrul, după o predare sau după o sesiune întreruptă.
---

# Reluarea proiectului

## Citește (în ordine, doar cât e nevoie)
1. `AGENTS.md`
2. `docs/PROJECT_STATE.md` — etapa, branch/commit verificat, blocaje, următoarea acțiune
3. Issue-ul activ (GitHub) și deciziile din `docs/decisions/` pe care le atinge

## Pași
1. `git status`, `git branch --show-current`, `git log --oneline -10`. Compară commitul cu cel din `PROJECT_STATE.md`.
2. Dacă diferă sau există modificări necomise: reconstruiește starea din Git și cod; notează discrepanța.
3. Verifică rapid că proiectul pornește: `pnpm install --frozen-lockfile && pnpm typecheck` (și `pnpm test:unit`).
4. Formulează în 2–4 rânduri: ce continui, criteriul de finalizare, ce ai nevoie de la Daniel.

## Livrabil
Un rezumat scurt în conversație + (dacă starea s-a schimbat) `docs/PROJECT_STATE.md` actualizat.

## Nu este autorizat
Să recreeze fișiere existente, să schimbe stack-ul sau direcția vizuală, să facă force-push, să publice în producție.
