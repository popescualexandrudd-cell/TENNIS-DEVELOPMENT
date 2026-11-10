# 0002 — Rute localizate și publicarea traducerilor (acceptată, 10.11.2026)

**Context.** RO implicit, EN ulterior; nu se publică pagini EN goale; selectorul păstrează pagina echivalentă.

**Alegere.**
- Arbori de rute separați `(frontend)/ro/**` și `(frontend)/en/**`, fiecare cu root layout propriu; sluguri localizate
  centralizate în `src/lib/i18n/routes.ts`; fișierele de rută doar deleagă la view-uri comune.
- `/` → `/ro` prin redirect în `next.config.ts`.
- Comutator global `site-settings.englishEnabled` (implicit fals → toate rutele `/en` dau 404).
- Pagini fixe: câmpuri localizate Payload + bifă localizată `available`; fallback dezactivat (`fallback: false`).
- Articole: un document per limbă, legate prin `translationGroup`; unicitate `(language, slug)`.
- `hreflang` și linkul din selector numai către traduceri publicate.

**Motiv.** Fără middleware de rescriere; rute statice ușor de verificat; `<html lang>` corect; articolele traduse au propriul
ciclu de publicare.

**Alternative respinse.** Segment dinamic `[locale]` + rescrieri în middleware (mai fragil, rute duplicate posibile);
articole localizate în același document (statusul de publicare ar fi comun ambelor limbi).

**Consecințe.** Schimbarea limbii reîncarcă pagina (root layout diferit). O pagină nouă = un fișier per limbă.

**Reconsiderare.** Dacă apar mai mult de 2–3 limbi.
