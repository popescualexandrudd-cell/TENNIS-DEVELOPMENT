# 0006 — Paleta v2: soft blue, midnight navy, coral orange, negru (acceptată ca propunere de lucru, 10.11.2026)

**Context.** Brief-ul definea o paletă verde/zgură (`background #F7F5F0`, `brand-primary #234638`, `accent-clay #A64B35`,
`accent-tennis #D6E56B`). În timpul primei sesiuni Daniel a cerut un site „ca patrickmouratoglou.com” și a propus paleta
soft blue, midnight navy, coral orange și negru (sau o alegere proprie).

**Alegere.** Paleta propusă de Daniel, cu valori alese pentru contrast (tabelul din `docs/DESIGN_SYSTEM.md`):
navy `#0F1B33`, soft blue `#DCE8F5`, coral `#FF6B4A`, negru `#0B0B0C`, plus nuanțe de suport (`#B83C22` coral pentru text,
`#A9B8D0` text secundar pe închis). Structura vizuală se apropie de principiile referinței: header și hero închise,
titlu principal cu majuscule, CTA puternic.

**Reguli de contrast.** Coral NU se folosește ca fundal cu text alb (2.8:1) și nici ca text mic pe fundal deschis (2.6:1);
CTA-urile coral au text negru (7.0:1).

**Ce NU am preluat.** Nimic din textele, logo-ul, fotografiile sau compozițiile site-ului de referință — care nici nu a putut fi
accesat din mediul de lucru (DNS blocat). Principiile folosite sunt generale (hero imersiv, ierarhie puternică, CTA unic).

**Alternative.** Paleta inițială verde/zgură (rămâne posibilă: doar tokenurile din `globals.css` + câteva clase de secțiune).

**Consecințe.** `scripts/contrast.mjs`, monograma și wordmark-urile SVG au fost actualizate. Direcția vizuală așteaptă validarea finală
pe capturile din `docs/design/`.

**Reconsiderare.** După primele fotografii reale: dacă hero-ul navy concurează cu fotografia, se poate trece la fotografie full-bleed
cu suprapunere navy discretă.
