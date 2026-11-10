# 0008 — Fundal albicios și hero 3D soft blue în straturi (acceptată ca propunere de lucru, 10.11.2026)

**Înlocuiește parțial:** 0007 — fundalul negru. Se păstrează din 0007: structura (bară laterală, titluri Archivo Expanded,
carduri, butoane pastilă, câmpurile CMS pentru cifre și testimoniale).

**Context.** Daniel: „aș vrea un fundal 3D soft blue ca un layover, iar în spate să fie albicios”.

**Alegere.**
- Fundal `#F4F7FB` (albicios), text negru, carduri și footer navy, CTA coral cu text negru.
- Hero: trei straturi soft blue (`.hero-layer-1..3`) rotite în perspectivă CSS (`rotateX`/`rotateZ`/`translateZ`), cu liniile
  terenului și mingea coral pe stratul de sus; plutire lentă de 14 s, oprită la `prefers-reduced-motion`.
  O fotografie reală apare ca un card plutitor deasupra straturilor.
- Zonele navy redefinesc variabilele de culoare (`.on-navy`, `.card-navy`), ca textul, focusul și contururile să rămână
  lizibile fără clase duplicate.

**De ce CSS și nu WebGL (Three.js/R3F).** Brief-ul cere un site complet funcțional fără 3D, LCP ≤ 2,5 s și testare pe telefoane modeste.
Efectul cerut (straturi, adâncime) se obține fără JavaScript, fără canvas și fără descărcări suplimentare. O scenă WebGL rămâne
opțiune ulterioară (roadmap), cu încărcare dinamică și imagine statică de rezervă.

**Verificare.** `scripts/contrast.mjs`; axe fără încălcări serioase pe 4 pagini × 2 viewporturi; capturi în `docs/design/`.

**Reconsiderare.** După fotografiile reale, sau dacă Daniel vrea o scenă 3D interactivă.
