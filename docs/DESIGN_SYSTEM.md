# Design system

**Direcția v5** (decizii [0007](decisions/0007-dark-editorial-sport.md) + [0008](decisions/0008-light-3d-hero.md) + [0009](decisions/0009-sunset-court-palette.md), 10.11.2026):
editorial-sportiv pe fundal albicios, cu hero 3D din straturi; paleta „apus pe teren” (portocaliu, ardezie, albastru prăfuit) după imaginea de referință trimisă de Daniel. Structura pornește de la capturile patrickmouratoglou.com
trimise de Daniel (bară laterală, titluri late cu majuscule, carduri, butoane pastilă); am preluat principii, nu identitate —
fără texte, logo, fotografii sau wordmark-ul în două greutăți al referinței. **Propunere — așteaptă validarea lui Daniel** (issue #1).

Capturi (conținut local de seed marcat `[EXEMPLU]`): `docs/design/homepage-desktop.png`, `docs/design/homepage-mobile.png`,
`docs/design/article-desktop.png`.

## Culori
Sursa tehnică: `src/styles/globals.css`. Verificare automată: `node scripts/contrast.mjs` (CI) + axe în e2e.
Zonele ardezie (`.on-navy`, `.card-navy` — numele claselor au rămas din v4) redefinesc variabilele text/focus/contur — valorile din coloana „pe ardezie”.

| Token | Fundal deschis | Pe ardezie | Utilizare / contrast |
|---|---|---|---|
| `background` | `#F4F7FB` | — | fundal albicios |
| `panel` | `#FFFFFF` | — | inputuri, mesaje |
| `soft-blue` 1/2/3 (albastru prăfuit / oțel) | `#D5E0EB` · `#B9C8D9` · `#9AAEC4` | — | straturile hero, placeholder imagini; negru pe `#D5E0EB` 14.7:1 |
| `navy` / `navy-card` (ardezie) | `#1C2633` / `#2A3646` | — | footer, carduri cifre, pași, antrenamente, testimoniale |
| `text-primary` | `#0B0B0C` (18.3:1) | `#F4F7FB` (11.4:1 pe card) | titluri, text |
| `text-secondary` | `#4B5565` (7.0:1) | `#AEBBCB` (6.3:1 pe card) | explicații, metadate |
| `coral` (portocaliu apus) | `#F26A3D` | `#F26A3D` | **fundal** CTA cu text negru (6.5:1); niciodată text alb (3.0:1) |
| `coral-text` | `#B4441D` (5.2:1) | `#F28A5E` (5.0:1 pe card) | etichete, numerotări, erori; portocaliul pur ca text pe deschis are doar 2.8:1 |
| `control-border` | `#6B7689` (4.6:1 pe alb) | `#8794A6` (4.0:1) | contur inputuri și butoane outline |
| `focus` | `#1D5FD1` (5.4:1) | `#F28A5E` (6.2:1) | inel de focus 3px |
| `border` | negru 12% | alb 14% | doar separatoare decorative |

## Hero 3D
Trei straturi rotite în perspectivă CSS: ardezie (jos), albastru oțel (mijloc), portocaliu → piersică → albastru prăfuit (sus), cu dâre fine
de „mișcare”, linii albe de teren și minge galben-verzuie; voal albicios sub titlu pentru lizibilitate,
plutire de 14 s (oprită la `prefers-reduced-motion`). Fără WebGL, fără JavaScript. Fotografia reală, când există, devine un card plutitor.

## Tipografie
- **Archivo Expanded** (titluri, navigație, cifre): Archivo variabil (Omnibus-Type, SIL OFL 1.1, fără Reserved Font Name) instanțiat
  la lățime 125%, greutăți 500–900, cu fontTools → `public/fonts/archivo-{latin,latin-ext}-expanded-normal.woff2` (~32 KB fiecare).
- **Source Sans 3** (text, formulare, articole), variabil 200–900, normal + italic (OFL).
- Diacritice ă â î ș ț și majuscule verificate în fișierele reale. Preîncărcate: doar fișierele `latin` normale.
- Stiluri: `.display` = majuscule, 850, spațiere -0.035em, line-height 0.92; `.display-light` = 500 (titluri în două tonuri,
  ex. „CUM **LUCREZ**”). Mărimi: `.h-hero` 36 → 88 px · `.h-page` 24 → 80 px (cuvinte lungi pe mobil) · `.h-section` 32 → 64 px ·
  `.h-card`. Text 17/18 px; articole 18/19 px, line-height 1.7, culoare `#1F2530`, coloană 68ch.

## Layout
- Desktop (≥ 1024 px): bară laterală fixă de 320 px, pe fundalul albicios — wordmark sus; navigație mare cu majuscule, CTA, limbă și social jos.
  Conținutul (`.content-shell`) stă la dreapta, container max 1240 px.
- Mobil: bară de sus (wordmark + „Meniu” pastilă), meniu pe tot ecranul cu linkuri mari și CTA.
  Fără `backdrop-filter` pe header: ar limita meniul `fixed` la înălțimea barei (bug găsit și testat în e2e).
- Spațiere secțiuni 64 px mobil / 112 px desktop; secțiunile sunt separate de linii subțiri.
- Colțuri: 24 px carduri mari și hero, 14 px imagini, 6 px carduri navy compacte; pastile pentru butoane și inputuri.
- Zone tactile ≥ 44 × 44 px; butoane și inputuri 48–52 px.

## Componente
Hero 3D (nume uriaș + tagline subțire; introducerea și CTA-urile **sub** scenă) · `btn-primary` (coral, text negru) · `btn-outline` (contur gri-albăstrui) · carduri de antrenament (numerotate, foto opțional,
2 pe rând) · carduri navy pentru cifre și pași · testimoniale (doar cu acord) · carduri de articol · formular cu inputuri pastilă și
tipuri de solicitare ca pastile selectabile · comutator de limbă pastilă (apare doar când engleza e publică).

## Conținut condiționat (nimic inventat)
Secțiunile apar doar cu date reale din CMS: „Pe scurt” (cifre confirmate), „Ce spun jucătorii” (citat + acord bifat), antrenamente
(`confirmed`), jurnal (articole publicate), „Despre” (text). Logo-urile de parteneri **nu** sunt implementate: se adaugă doar când există
parteneriate reale și drept de folosire a mărcilor.

## Imagini
- Fotografii reale cu Daniel; câmpul `rights` din Media ≠ „neverificat”, altfel imaginea nu apare public.
- Fără fotografie: straturile 3D cu liniile terenului (SVG decorativ). Nu este o fotografie și nu reprezintă o persoană.
- `next/image` cu AVIF/WebP, `sizes` explicite, `priority` doar pentru imaginea hero.

## Interacțiune
Tranziții CSS 150–250 ms; hover și focus vizibile; meniu mobil accesibil (Escape, focus restituit); `prefers-reduced-motion` respectat;
fără carusel cu JavaScript, fără scroll controlat, fără video automat.

## Identitate
- Wordmark „DANIEL POPESCU” în Archivo Expanded 800, spațiere 0.08em (`src/components/Wordmark.tsx`).
- Monogramă DP — propunere: `public/brand/dp-monogram.svg` (+ `-mono-dark`, `-mono-light`). Wordmark SVG: `public/brand/wordmark-*.svg`
  folosesc text live — trebuie convertite în contururi înainte de folosirea în afara site-ului.

## Istoric
v1 verde/zgură (brief) → v2 navy/coral pe fundal deschis (0006) → v3 temă închisă (0007) → v4 albicios + hero 3D soft blue (0008)
→ v5 paleta „apus pe teren”: portocaliu, ardezie, albastru prăfuit (0009).
