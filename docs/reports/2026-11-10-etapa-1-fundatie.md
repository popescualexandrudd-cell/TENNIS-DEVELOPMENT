# Raport — Etapa 1, fundație și prima versiune funcțională (10.11.2026)

## Obiectiv
Pornirea proiectului: memorie de lucru, organizare GitHub, fundație tehnică, site RO/EN cu jurnal și contact, direcție vizuală propusă.

## Livrat
Aplicația Next.js + Payload + PostgreSQL; 9 colecții + 1 global; rute publice RO/EN; jurnal cu drafturi, preview și redirecturi;
contact persistent; SEO tehnic; design system v2 cu paleta cerută de Daniel; CI; Docker (neverificat); backup/restaurare;
documentație (`docs/`), decizii 0001–0006, template-uri GitHub, 2 skilluri locale (`project-resume`, `stage-validation`);
7 issues pentru restul etapei.

## Checklist de acceptare (criteriile obligatorii din brief)
- [x] Layout verificat pe telefon și desktop — local, capturi `docs/design/` + e2e pe 2 viewporturi
- [x] Navigare și formulare utilizabile din tastatură — skip link, meniu mobil cu Escape/focus, câmpuri cu etichete și erori asociate (e2e + axe)
- [x] Fără scroll orizontal accidental — e2e pe `/ro`, `/ro/contact`, `/ro/antrenamente`
- [x] Contrast și focus verificate — `scripts/contrast.mjs` + axe (WCAG 2.1 AA, fără serioase/critice)
- [x] Contactul persistă date și tratează erorile — integrare + e2e
- [x] Drafturile nu sunt accesibile public, inclusiv prin API — integrare (Local API) + e2e (REST real)
- [x] Publicarea și retragerea actualizează cache-ul — e2e
- [x] Traducerile și URL-urile nu generează pagini goale — EN 404; jurnal fără articole 404; secțiuni goale ascunse
- [ ] Fără texte fictive — **pe site-ul public** se respectă (conținutul `[EXEMPLU]` există doar în seed-ul local); conținutul real lipsește (#2)
- [x] Build, typecheck și testele relevante trec — local
- [x] Backup și restaurare documentate și verificate în mediul disponibil — local; BLOCAT pentru mediul real (#4)
- [ ] Lighthouse / CWV — nerulat (#5)

## Verificări și rezultate (commit `d4da602`, local)
lint ✓ · typecheck ✓ · contrast ✓ · unit 14/14 · integrare 14/14 · build ✓ (22 de pagini statice) · e2e 16 trecute / 2 omise intenționat.

## Probleme deschise
Docker neverificat; SMTP neconfigurat; site-urile de referință inaccesibile din mediu; milestones și protecția branchului necreate (#7).

## Decizii
0001 stack · 0002 rute și traduceri · 0003 status editorial · 0004 contact · 0005 analytics (propusă) · 0006 paleta v2.

## Costuri sau servicii introduse
Niciun serviciu plătit. GitHub Actions folosește minutele incluse ale planului (de setat bugetul la 0 — #7).

## Agenți
Lucrul a fost făcut secvențial de un singur agent (coordonator), plus un subagent de fetch web pentru site-urile de referință (eșuat: DNS).
Verificarea este **proprie**, nu review independent.

## Următorul pas
Validarea designului și conținutul real (#1, #2), apoi CI pe GitHub (#7).
