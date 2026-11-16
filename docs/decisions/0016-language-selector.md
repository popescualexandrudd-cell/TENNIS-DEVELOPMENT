# 0016 — Selector de limbă lângă „Meniu”, 5 limbi (acceptată, 16.11.2026, cerută de Daniel)

**Context.** Cerere: buton de selectare a limbii lângă meniul dropdown, cu română, engleză, ucraineană, germană și franceză.
Până acum, comutatorul RO/EN stătea în panoul meniului și apărea doar când engleza era publică (decizia 0002).

**Alegere.**
- Lista limbilor afișate: `siteLanguages` în `src/lib/i18n/config.ts` (RO, EN, UK, DE, FR, nume native).
- `src/components/LanguageSwitch.tsx`: buton pastilă (glob + cod limbă curentă) în header, imediat înaintea butonului
  „Meniu”, care deschide o listă dropdown; Escape / clic în afară închid lista. Mereu vizibil.
- Limba curentă e marcată `aria-current`; cealaltă limbă publică (RO/EN) e link care păstrează pagina echivalentă (0002).
- UK, DE, FR (și EN cât timp nu e publică) apar dezactivate, cu „în pregătire”: nu au rute, dicționar sau conținut tradus.

**Motiv.** Respectă cererea fără pagini goale și fără traduceri inventate; rutele și publicarea rămân cele din 0002.

**Alternative respinse.** Traducere în client cu `localStorage` (contrazice rutele localizate, SEO și `hreflang`);
rute `/uk`, `/de`, `/fr` cu texte traduse automat (conținut neverificat de Daniel).

**Consecințe.** Activarea unei limbi noi = cod în `locales`, arbore `(frontend)/<cod>/**`, sluguri în `routes.ts`,
dicționar, localizare Payload + migrație, conținut tradus și verificat. Garda: `tests/language-switch.test.mjs`.

**Reconsiderare.** La activarea primei limbi peste RO/EN — atunci se reevaluează și structura de rute (0002, „mai mult de 2–3 limbi”).
