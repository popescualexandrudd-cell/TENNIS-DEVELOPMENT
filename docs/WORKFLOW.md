# Flux de lucru

## Task → implementare → verificare → integrare
1. Fiecare schimbare relevantă pornește de la un Issue (template „Task” sau „Bug”) cu rezultat, scope, în afara scope-ului,
   dependențe, checklist de acceptare și metodă de verificare.
2. Branch scurt din `main`: `feat/<nr>-<slug>`, `fix/<nr>-<slug>`, `docs/<nr>-<slug>`. O temă per branch.
3. Plan scurt în Issue sau PR → implementare → verificări relevante → review al diff-ului → documentație afectată.
4. PR (template-ul din `.github/pull_request_template.md`), legat de Issue. CI trebuie să fie verde.
5. Integrare numai după criteriile de acceptare și cu autorizarea existentă. „Done” = verificat, nu doar scris.

Sesiunile Claude Code în cloud pot folosi un branch atribuit de mediu (ex. `claude/<nume>`); regula unei teme per branch rămâne.

## Board
GitHub Projects (dacă e folosit): Backlog → Ready → In progress → In review → Done.
Taskurile blocate primesc eticheta `blocked`, cu motivul și condiția de deblocare în Issue.

## Etichete
`type:task`, `type:bug`, `area:design`, `area:cms`, `area:frontend`, `area:seo`, `area:ops`, `area:content`,
`blocked`, `needs-daniel` (decizie sau informație de la Daniel).

## Verificări
| Schimbare | Minim |
|---|---|
| Doar documentație | review al textului |
| Cod fără UI | `pnpm lint && pnpm typecheck && pnpm test` |
| UI, contact, publicare, acces | + `pnpm build && pnpm test:e2e`, capturi mobil/desktop |
| Schemă | + `pnpm migrate:create`, migrație comisă, `pnpm test:int` pe bază curată |

CI (`.github/workflows/ci.yml`) rulează lint, typecheck, contrast, unit, integrare, build și e2e cu PostgreSQL efemer și date sintetice.
Un CI verde confirmă doar aceste verificări — nu validare vizuală, conținut corect sau funcționare în producție.

## Protecția branchului
Pe planul GitHub Free, regulile de protecție pentru repository-uri private pot fi indisponibile. Până la verificare,
disciplina este procedurală (PR + checklist + CI), nu impusă tehnic. Stare curentă: `docs/PROJECT_STATE.md`.

## Review
Etichetează corect: verificare proprie / review de la alt agent / review uman. A doua lectură a aceluiași agent nu este review independent.

## Interzis fără autorizare explicită
Force-push, rescriere de istoric, ștergeri destructive, publicare în producție, cumpărarea de servicii, activarea de trialuri plătite.
