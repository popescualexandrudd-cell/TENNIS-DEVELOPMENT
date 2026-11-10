# 0009 — Paleta „apus pe teren”: portocaliu, ardezie, albastru prăfuit (acceptată ca propunere de lucru, 10.11.2026)

**Înlocuiește parțial:** 0008 — culorile. Se păstrează: fundalul albicios, structura, hero-ul 3D din straturi CSS, tipografia.

**Context.** Daniel a trimis o imagine de referință (afiș de tenis: fundal portocaliu cu efect de mișcare, panou gri-albastru
închis, text alb cu un cuvânt accentuat în portocaliu) și a întrebat: „culorile în genul acesta poți?”. Am preluat doar paleta și
atmosfera; nu folosim logo-ul, textul sau fotografiile din imagine.

**Alegere.**
- Portocaliu apus `#F26A3D` (înlocuiește coral `#FF6B4A`) — fundal CTA, numai cu text negru (6.5:1); alb pe el are 3.0:1, deci nu.
- Portocaliu pentru text pe deschis `#B4441D` (5.2:1); pe ardezie `#F28A5E` (5.0:1).
- Ardezie `#1C2633` / card `#2A3646` (înlocuiesc midnight navy) — footer, carduri cifre, pași, antrenamente, testimoniale.
- Albastru prăfuit / oțel `#D5E0EB` · `#B9C8D9` · `#9AAEC4` (înlocuiesc soft blue).
- Hero: stratul de jos ardezie, cel din mijloc albastru oțel, cel de sus un gradient portocaliu → piersică → albastru prăfuit, cu
  dâre fine de „mișcare” (CSS `repeating-linear-gradient` + `blur`), linii albe de teren și minge galben-verzuie (decorativ).

**Verificare.** `node scripts/contrast.mjs` (toate perechile folosite trec), axe în e2e pe 4 pagini × 2 viewporturi, capturi în `docs/design/`.

**Reconsiderare.** La validarea lui Daniel (issue #1) — de ex. hero pe fundal ardezie cu text alb, ca panoul din referință.
