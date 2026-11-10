# 0007 — Temă închisă editorial-sportivă și Archivo Expanded (10.11.2026)

> **Parțial înlocuită de [0008](0008-light-3d-hero.md):** fundalul devine albicios; structura, tipografia și câmpurile CMS de aici rămân.

**Înlocuiește parțial:** 0006 (structura pe fundal deschis); paleta din 0006 rămâne, aplicată pe negru.
**Abatere de la brief:** tipografia pentru titluri trece de la Manrope la Archivo Expanded; brief-ul cerea Manrope.

**Context.** După v2, Daniel a trimis capturi ale patrickmouratoglou.com („cam așa îmi doresc website-ul”): fundal negru,
navigație laterală mare cu majuscule, hero ca un card foto mare, titluri late foarte mari, carduri foto pentru servicii, carduri navy,
butoane pastilă, secțiuni cu cifre, testimoniale, logo-uri de parteneri, formular cu inputuri rotunjite.

**Alegere.**
- Fundal negru `#070708`, carduri navy, accent coral, soft blue pentru detalii (tabelul din `docs/DESIGN_SYSTEM.md`).
- Titluri, navigație și cifre: Archivo (OFL) instanțiat la lățimea 125%. Manrope nu are lățime extinsă, deci nu poate da efectul cerut.
- Bară laterală fixă pe desktop; meniu pe tot ecranul pe mobil.
- Câmpuri CMS noi, toate opționale și ascunse când sunt goale: `home.facts` (cifre confirmate), `home.testimonials` (cu `consent`),
  `home.aboutHeading`, `home.coachingHeading`, `coaching-services.image`. Migrația: `20261110_103117_home_facts_testimonials_service_image`.

**Ce nu am preluat.** Textele, fotografiile, logo-ul și wordmark-ul în două greutăți ale referinței; compoziția exactă (păstrăm
cele 6 secțiuni din brief și ordinea lor). Logo-urile de parteneri nu se implementează fără parteneriate reale.

**Compromisuri.** Textul lung pe negru obosește mai repede decât pe fundal deschis → articolele folosesc `#E3E9F2`, line-height 1.7 și 68ch.
Archivo Expanded ocupă mult spațiu → `.h-page` are un minim mai mic pe mobil, iar e2e verifică lipsa scrollului orizontal pe 4 pagini.

**Verificare.** Contrast (`scripts/contrast.mjs`), axe WCAG 2.1 AA fără încălcări serioase pe `/ro`, `/ro/contact`, `/ro/antrenamente`,
`/ro/jurnal`, pe desktop și mobil; meniul mobil testat cu `toBeInViewport`.

**Reconsiderare.** După fotografiile reale (hero foto vs. motiv grafic), sau dacă Daniel preferă o variantă luminoasă (v2 rămâne în istoric).
