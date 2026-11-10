# 0011 — Hero pe panou ardezie și titluri italic (acceptată la cererea lui Daniel, 10.11.2026)

**Modifică:** 0008/0009 (scena hero pe fundal albicios, text negru) și tipografia titlurilor din DESIGN_SYSTEM.

**Context.** Am propus două idei apropiate de afișul de referință („OWN THE NEXT **POINT**”): hero pe fundal ardezie cu text alb și
ultimul cuvânt în portocaliu, plus titluri înclinate. Daniel: „1-2 momentan” (amândouă). Tot atunci: „elimină terenul acela” —
cardul cu clipul demonstrativ (teren filmat de sus) din hero a fost scos din seed.

**Alegere.**
- `.hero-stage` devine un panou ardezie (`#1C2633` → `#3D4C60`, cu `.on-navy`), pe fundalul albicios al paginii, care rămâne.
  Straturile 3D: albastru oțel în spate, portocaliu cu „mișcare” deasupra. Pe telefon terenul urcă în partea de sus a panoului.
- Titlul: nume alb, **ultimul cuvânt în portocaliu** (`coral-text` pe ardezie, `#F28A5E`, 6.2:1); voal ardezie ≥ 88% sub text, în
  contextul `isolate` al blocului de text (altfel ar sta sub straturile 3D).
- `.display` folosește **Archivo Italic adevărat** (instanțiat la lățime 125%, greutăți 500–900, ca varianta normală), cu
  `font-synthesis: none` — fără înclinare sintetică. Fișierul italic latin e preîncărcat (titlul hero e LCP).

**Verificare.** `scripts/contrast.mjs` (perechi noi pentru voal, inclusiv cazul cel mai deschis: ardezie 88% peste piersică = `#36363D`),
diacritice ă â î ș ț în ambele subseturi italic, e2e + axe pe 4 pagini × 2 viewporturi, capturi.

**Reconsiderare.** La validarea designului (issue #1) sau când apare fotografia reală pentru hero.
