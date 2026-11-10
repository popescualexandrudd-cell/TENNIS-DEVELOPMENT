# Design system

Direcție: editorial sportiv cu contrast puternic — hero navy pe toată lățimea, titlu principal cu majuscule, CTA coral, fotografie reală, tipografie clară.
Inspirație declarată de Daniel: patrickmouratoglou.com (principii de structură, fără copierea identității; site-ul nu a putut fi deschis din mediul de lucru). **Propunere v2 — așteaptă validarea lui Daniel.**
Capturi ale propunerii (cu conținut local marcat `[EXEMPLU]`): `docs/design/homepage-desktop.png`, `docs/design/homepage-mobile.png`,
`docs/design/article-desktop.png`.

## Culori — paleta v2 (decizia [0006](decisions/0006-palette-navy-coral.md), cerută de Daniel la 10.11.2026)
Sursa tehnică: `src/styles/globals.css` (`:root`). Verificare automată: `node scripts/contrast.mjs` (rulează în CI).
Paleta inițială din brief (verde/zgură) este păstrată istoric în decizia 0006.

| Token | Valoare | Utilizare | Contrast verificat |
|---|---|---|---|
| `background` | `#F4F7FB` | fundal principal (alb rece) | — |
| `surface` | `#FFFFFF` | formulare, secțiuni de conținut | — |
| `soft-blue` | `#DCE8F5` | secțiuni de ritm („Cum lucrez”) | text-secondary 6.1:1, navy 13.8:1 |
| `text-primary` | `#0B0B0C` (negru) | titluri, text | 18.3:1 pe background |
| `text-secondary` | `#4B5565` | explicații, metadate | 7.0:1 pe background |
| `brand-primary` | `#0F1B33` (midnight navy) | header, hero, linkuri, butoane secundare | alb pe navy 17.1:1 |
| `brand-hover` | `#1A2A4A` | hover pe navy | — |
| `accent-coral` | `#FF6B4A` | **fundal** CTA (cu text negru 7.0:1), eyebrow și focus pe navy (6.1:1), puncte/numerotare | alb pe coral doar 2.8:1 → interzis |
| `accent-coral-hover` | `#FF8466` | hover CTA | negru 8.2:1 |
| `accent-coral-text` | `#B83C22` | coral pentru **text mic** pe fundal deschis (etichete, erori) | 5.3:1 pe background |
| `on-dark-muted` | `#A9B8D0` | text secundar pe navy/negru | 8.5:1 / 9.8:1 |
| `border` | `#D5DEEA` | **doar** separatoare decorative (1.3:1) | — |
| `control-border` | `#6B7689` | contur inputuri | 4.6:1 pe alb |
| `focus` | `#1D5FD1` | focus pe fundal deschis | 5.4:1; pe navy/negru focusul este coral |

Proporție țintă: suprafețe luminoase majoritare; navy pentru header + hero; negru pentru footer; coral ≤ 5% (CTA, puncte, etichete).

## Tipografie
- **Manrope** (titluri, 200–800 variabil) și **Source Sans 3** (text, 200–900 variabil, normal + italic). Licență SIL OFL 1.1
  (fișierele `public/fonts/OFL-*.txt`). Sursa fișierelor: pachetele `@fontsource-variable/*` (5.3.x).
- Găzduite local în `public/fonts/`, subseturi `latin` + `latin-ext`; diacriticele ă â î ș ț (și majusculele) verificate cu fontTools.
  Doar fișierele latin normale sunt preîncărcate; latin-ext și italic se descarcă la nevoie (`unicode-range`).
- Dimensiuni: hero 38 → 84 px (`clamp`), titluri secțiune 30 → 44 px, text 17/18 px, articole 18/19 px cu line-height 1.65,
  coloană de lectură 68ch.

## Layout
Container 1240 px; gutter 20/24/40 px; spațiere secțiuni 56 px mobil / 104 px desktop; colțuri 4–8 px; fără umbre decorative;
zone tactile ≥ 44 × 44 px (butoane 48 px). Header sticky 72 px.

## Componente
`btn-primary` (coral, text negru), `btn-dark` (navy, text alb), `btn-secondary` (contur navy), `link-arrow`, `field-input`, `eyebrow`, carduri de serviciu
(linie navy sus, fără chenar), carduri de articol (imagine opțională, categorie, dată, titlu, rezumat), secțiune soft blue
(„Cum lucrez”) cu pași numerotați pe coral; header și hero navy (`on-dark`), footer negru.

## Imagini
- Fotografii reale cu Daniel; câmpul `rights` din Media trebuie să fie altul decât „neverificat”, altfel imaginea nu apare public.
- Fără fotografie: hero-ul afișează un motiv grafic (linii de teren pe navy, minge coral, SVG). Nu este o fotografie și nu reprezintă o persoană.
- `next/image` cu AVIF/WebP, `sizes` explicite, `priority` doar pentru imaginea LCP.

## Interacțiune
Tranziții CSS 150–250 ms; hover + focus vizibile; meniu mobil accesibil (Escape, focus restituit); respect pentru
`prefers-reduced-motion`; nimic ascuns dacă JavaScript eșuează (în afară de trimiterea formularului, care necesită JS).

## Identitate
- Wordmark tipografic „DANIEL POPESCU” (Manrope 800, spațiere 0.16em; alb pe navy în header) — în cod: `src/components/Wordmark.tsx`.
- Monogramă DP — propunere secundară: `public/brand/dp-monogram.svg` + variante monocrome (`-mono-dark`, `-mono-light`).
- `public/brand/wordmark-{navy,dark,light}.svg` folosesc text live; înainte de folosire în afara site-ului trebuie convertite în contururi.
