# Analiză cod — website Daniel Popescu (11.11.2026)

Analiză statică, numai prin citirea codului de pe branchul curent (bază `0ab7ec0`). **Nu am rulat** build, teste sau site-ul; afirmațiile despre comportament vin din cod, nu din execuție.

## 1. Ce există deja (demonstrabil din cod)

| Zonă | Dovadă în cod |
|---|---|
| Stack | Next.js 16.4.6 + Payload 3.92 + PostgreSQL (`package.json`, `src/payload.config.ts`) |
| Rute RO/EN | `src/lib/i18n/routes.ts` (sluguri localizate: `/ro/despre` ↔ `/en/about`, `/ro/antrenamente` ↔ `/en/coaching` etc.); `/` → `/ro` (`next.config.ts`, redirect temporar) |
| EN controlat | `isLocaleEnabled` în `src/lib/content.ts`: engleza e publică doar cu `englishEnabled`; altfel 404 (test e2e „engleza nepublicată răspunde 404”) |
| Navigație | `src/components/SiteHeader.tsx` — linkuri doar pentru paginile disponibile (`getAvailability`); `NavLinks.tsx` cu `aria-current`; `LanguageSwitch.tsx` păstrează pagina echivalentă sau cade pe homepage/jurnal |
| Homepage | `src/features/site/HomeView.tsx` — hero, despre, cifre, antrenamente, „Cum lucrez”, păreri, jurnal, contact; fiecare secțiune apare doar cu conținut real din CMS; JSON-LD Person + WebSite |
| Coaching | colecția `CoachingServices` (doar `confirmed`, max. 3, traducere completă), pagină `antrenamente`/`coaching`, `ServiceCard.tsx` |
| Contact | `ContactForm.tsx` (validare, mesaje pe câmp, `aria-live`, honeypot) → `api/contact` → `features/contact/handle.ts`: limită mărime, zod, rate limit cu IP hash, salvare înainte de email; teste `tests/int/contact.test.ts`, `tests/unit/contact-schema.test.ts`, e2e |
| Comunitate (parțial) | păreri de la sportivi: formular public + aprobare în admin (`features/testimonials/*`) |
| Legal / securitate / SEO | pagini legale generate din cod, CSP/HSTS, sitemap, robots, OG, manifest (decizii 0013–0015) |

## 2. Ce lipsește

1. **Tehnologie, comunitate (ca secțiune), proiecte — nu există deloc.** Nicio rută, `PageKey`, colecție CMS sau cheie de dicționar pentru ele (căutare în `src/` după tehnolog/comunit/proiect/technolog/communit/project: zero rezultate în conținut). Singura legătură cu „comunitatea” sunt părerile sportivilor.
2. **Legal în EN:** `getAvailability` setează `privacy/cookies/terms` doar pentru `ro`, iar `LegalPageView` dă 404 altfel. Când se activează engleza, formularul de contact EN afișează „privacy policy” **fără link** (`ContactForm.tsx`, ramura `privacyHref === null`) — informarea GDPR lipsește exact unde se colectează date.
3. **Conținut real** (bio, oferte, locație, fotografii, date operator) — blocat la Daniel (`docs/PROJECT_STATE.md`, issues #2–#3).
4. **Teste lipsă:** niciun e2e pentru comutatorul RO→EN cu engleza activă (doar cazul 404) și niciun test unitar pentru `LanguageSwitch`/`pageKeyFromPath` pe pagini de articol.
5. Neverificat în mediu: email real (SMTP), Docker, Lighthouse (consemnat deja în `PROJECT_STATE.md`).

## 3. Primele trei îmbunătățiri (în ordinea impactului)

### 1. Pagina „Proiecte & comunitate” (RO `/ro/proiecte`, EN `/en/projects`)
Acoperă golul principal din obiectiv (tehnologie, comunitate, proiecte), cu același model „apare doar cu conținut confirmat”.
- **Fișiere:** `src/lib/i18n/config.ts` (`pageKeys` + `projects`), `src/lib/i18n/routes.ts`, `src/lib/i18n/dictionaries.ts` (nav + titluri RO/EN), colecție nouă `src/cms/collections/Projects.ts` (titlu, tip: tehnologie/comunitate/proiect, descriere, link, `confirmed`, localizat) + înregistrare în `src/payload.config.ts` + migrație, `src/lib/content.ts` (`getAvailability.projects`), `src/app/(frontend)/{ro/proiecte,en/projects}/page.tsx`, `src/components/SiteHeader.tsx`, `src/app/sitemap.ts`, `tests/unit/routes.test.ts`.
- **Criterii de acceptare:** fără proiecte confirmate, pagina dă 404 și nu apare în meniu/sitemap; cu cel puțin un proiect confirmat apare în meniu în ambele limbi, iar `LanguageSwitch` duce la pagina echivalentă; textele noi există în RO și EN; lint, typecheck, unit, int și e2e trec; axe fără încălcări serioase pe pagina nouă.

### 2. Informare de confidențialitate în EN înaintea activării englezei
Risc legal: formularul EN colectează date fără link la informare.
- **Fișiere:** `src/features/legal/content-en.tsx` (nou, după `content-ro.tsx`), `src/features/legal/LegalPageView.tsx`, `src/lib/content.ts` (condiția `locale === 'ro'`), `tests/e2e/security-seo.spec.ts` sau `site.spec.ts`.
- **Criterii de acceptare:** cu engleza activă și date legale complete, `/en/privacy`, `/en/cookies`, `/en/terms` răspund 200 și apar în sitemap cu hreflang; formularul de contact EN conține un link funcțional la `/en/privacy`; fără date legale complete, paginile EN rămân 404 ca în RO; textul EN e marcat pentru verificare juridică.

### 3. Teste pentru navigația bilingvă
Comutatorul de limbă e logică netestată cu engleza activă.
- **Fișiere:** `tests/e2e/site.spec.ts` (scenariu cu `englishEnabled`, prin seed/fixture), `tests/unit/routes.test.ts` (cazuri `pageKeyFromPath` pentru `/ro`, `/ro/despre`, `/ro/jurnal/slug`, căi necunoscute).
- **Criterii de acceptare:** cu engleza activă, de pe `/ro/despre` comutatorul duce la `/en/about`, de pe un articol fără traducere duce la `/en/journal`, iar de pe o pagină netradusă duce la `/en`; `hrefLang`/`lang` sunt setate corect; meniul EN conține doar paginile disponibile; testele noi trec local și în CI.
