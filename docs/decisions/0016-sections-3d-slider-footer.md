# 0016 — Secțiuni după structura referinței, slide-uri 3D, footer centrat, contact în doi pași (acceptată la cererea lui Daniel, 10.11.2026)

**Context.** Daniel a trimis capturi de pe patrickmouratoglou.com: „preia secțiunile ca la acesta fără design sau alte repere”,
„secțiunile să fie cu slide-uri 3D cu efecte și UI premium, footerul să fie la fel ca la Patrick”, „biografia sau povestea să fie un
buton… să se deschidă altă pagină”, apoi „fără filozofie”. Preluăm **structura**, nu textele, imaginile, logo-ul sau designul referinței.

**Alegere (homepage).**
1. Hero cu nume + tagline și butonul **„Povestea mea”** → `/ro/despre` (pagină separată, din CMS).
2. **Manifest**: o frază mare + 1–3 fraze (`home.manifestoHeading/Text`).
3. **Antrenamente** într-un **slider 3D** (carduri numerotate, media de fundal, CTA „Cere o ședință”).
4. Cifre („Pe scurt”) — neschimbate.
5. **Despre**: eticheta, titlu-afirmație, **frază îngroșată de deschidere** (`home.aboutLead`), text și „Povestea mea”.
6. Cum lucrez — neschimbat. 7. **Ce spun jucătorii** în slider 3D + „Lasă o părere”. 8. Jurnal. 9. Contact.
- Secțiunea „Filozofie” a fost construită și **scoasă** la cererea lui Daniel (fără câmpuri în CMS).

**Slider 3D** (`src/components/Slider3D.tsx`): fără bibliotecă; scroll orizontal nativ cu `scroll-snap` (merge fără JavaScript,
touch, trackpad); efect „coverflow” — rotație, adâncime, scalare și opacitate după distanța de centru, doar `transform`/`opacity`;
butoane anterior/următor, bară de progres, săgeți de la tastatură, `aria-roledescription="carusel"`, anunț „2 din 4”.
Cu `prefers-reduced-motion` nu există transformări. Înlocuiește regula „fără carusel cu JavaScript” din DESIGN_SYSTEM.

**Footer**: negru, centrat — wordmark, semnătură, iconițe sociale (doar conturi verificate din CMS; simple-icons CC0, LinkedIn glif
generic), navigație cu majuscule, separator, Termeni / Confidențialitate / Cookie-uri / email, copyright.

**Contact în doi pași**: 1) nume, email, telefon opțional cu prefix de țară; 2) tipul cererii, mesaj. Un singur `<form>`, validare
client pe pasul 1 și validare finală pe server; telefonul se salvează în format internațional (`contact_requests.phone`).

**Verificare.** e2e: slider (butoane, tastatură, anunț, reducere mișcare), formular în doi pași, axe pe 7 pagini, fără scroll orizontal.
