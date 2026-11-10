# 0010 — Fotografii și bucle video în secțiuni (acceptată la cererea lui Daniel, 10.11.2026)

**Modifică:** brief-ul („fără video automat”) și DESIGN_SYSTEM → Interacțiune.

**Context.** Daniel: „în locul culorii albastre de la secțiuni pune videouri demonstrative relevante secțiunilor ca în pozele model sau
poze cu sportivi fictivi”, apoi „sursa pozelor reală, de unde vrei tu”. La întrebarea despre video a ales „buclă scurtă, fără sunet”.

**Alegere.**
- `media` acceptă și MP4/WebM. Un clip are obligatoriu o **imagine de previzualizare** (`poster`, validare în CMS); fără ea, clipul nu apare.
- Câmpurile de media din hero, „Despre”, antrenamente, pașii „Cum lucrez” (nou: `home.method[].media`) și testimoniale primesc
  fotografie **sau** clip. Coperta articolelor rămâne doar imagine (`filterOptions`).
- `SectionMedia` + `LoopVideo`: se randează întâi fotografia/posterul (next/image); bucla video apare deasupra **doar** pe ecrane ≥ 768 px,
  fără `prefers-reduced-motion: reduce` și fără „economisire date”; rulează doar când e vizibilă, fără sunet, cu buton de pauză (WCAG 2.2.2).
  Pe telefon nu se descarcă niciun clip.
- Creditul media (`credit`) apare vizibil în colț — pentru materialele de bancă spune clar că nu sunt fotografii cu Daniel sau cu jucătorii lui.
- Open Graph folosește posterul, niciodată fișierul video.

**Material demonstrativ.** Fotografiile cu „sportivi fictivi” generate cu AI ar fi consumat credite plătite; site-urile foto gratuite
(Unsplash) cer verificare anti-bot pe care nu o ocolim. Am folosit 3 clipuri **Mixkit** (licență gratuită, uz comercial), cu persoane
neidentificabile (filmate de sus / din spate), tăiate la 8 s, fără sunet, ~0,2–1 MB; cadrele lor servesc drept fotografii.
Doar în seed-ul local (`scripts/seed-assets/demo-media/`, cu `LICENSES.md`), creditate „Mixkit · material demonstrativ”.
**Nu** sunt folosite pentru „Despre” (portretul lui Daniel) sau testimoniale — acolo ar sugera persoane reale care nu sunt.

**Verificare.** Unit (`tests/unit/media.test.ts`), e2e: clip pornit + pauză pe desktop, zero clipuri pe mobil și la „reducere mișcare”, axe.

**Reconsiderare.** Când Daniel are clipuri proprii de la antrenamente (preferabil), sau dacă LCP pe telefon depășește 2,5 s.
