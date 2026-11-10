# 0015 — SEO tehnic (acceptată la cererea lui Daniel, 10.11.2026)

**Context.** Daniel: „fă SEO”. Din etapa 1 existau: canonical, hreflang doar pentru traduceri publicate, sitemap, robots (indexare doar
cu `SITE_ENV=production`), Open Graph, JSON-LD pentru articole și „Despre”.

**Adăugat.**
- **Imagine Open Graph generată** (`/og/{locale}/page/{key}`, `/og/{locale}/article/{slug}`, 1200×630, în identitatea site-ului) pentru
  paginile fără fotografie. Titlul vine din CMS, nu din URL — nu se pot genera imagini cu text arbitrar. Fonturi TTF statice în
  `src/assets/og/` (OFL), incluse în build-ul standalone.
- **Twitter/X cards** (`summary_large_image`).
- **JSON-LD pe homepage:** `WebSite` + `Person` (nume, ocupație, descriere, imagine, zonă și rețele — doar din CMS).
- **Iconițe și manifest:** SVG, `favicon.ico`, `apple-touch-icon`, PNG 192/512, `manifest.webmanifest`.
- **Sitemap:** pagini legale + `lastModified` din CMS.
- Paginile legale incomplete au `noindex`.

**Ce nu depinde de cod (pentru Daniel):** texte reale cu cuvintele pe care le caută jucătorii („antrenor tenis {oraș}”, „lecții tenis
copii”), locația confirmată în Setări site, articole regulate în jurnal, profil Google Business, Search Console după lansare.

**Verificare.** `tests/e2e/security-seo.spec.ts` (canonical, OG, Twitter, JSON-LD, imaginea OG + 404, manifest, iconițe, sitemap).
