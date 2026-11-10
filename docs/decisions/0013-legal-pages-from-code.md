# 0013 — Pagini legale generate din cod + Setări site (acceptată la cererea lui Daniel, 10.11.2026)

**Context.** Daniel: „vreau să îmi faci politica de confidențialitate, cookies și tot ce mai ține de partea legală”. Site-ul colectează
date prin două formulare (contact, păreri) și nu are magazin online. Datele de identificare ale operatorului lipsesc încă.

**Alegere.**
- Trei pagini, **doar în română** deocamdată: `/ro/confidentialitate`, `/ro/cookies`, `/ro/termeni` (`src/features/legal/content-ro.tsx`).
  Textul descrie exact prelucrările din cod: câmpurile formularelor, hash-ul HMAC al IP-ului, temeiurile (art. 6 lit. a/b/f GDPR),
  destinatarii, drepturile + ANSPDCP, minorii (< 16 ani), securitatea, cookie-urile, informațiile cerute de Legea 365/2002 în Termeni.
- Datele variabile vin din **Setări site → Date legale**: forma juridică, denumire, CUI, Nr. ORC, adresă, email pentru date personale,
  furnizor de găzduire / email, transfer în afara SEE + garanții, durate de păstrare, data actualizării.
- **Publicare condiționată:** în producție (`SITE_ENV=production`) paginile apar numai cu datele obligatorii complete
  (`src/features/legal/operator.ts`); în dezvoltare apar cu golurile marcate „⟨de completat⟩” și `noindex`.
- **Fără banner de cookie-uri:** site-ul public nu setează cookie-uri și nu încarcă resurse de la terți (verificat în e2e), deci nu
  există nimic pentru care să fie nevoie de acord (Legea 506/2004, art. 4 alin. 5). Cookie-urile din administrare sunt strict necesare.
- **Durate de păstrare aplicate efectiv:** `pnpm retention` (zilnic, cron) șterge solicitările mai vechi de N luni și părerile
  neaprobate/respinse mai vechi de M luni (`src/features/legal/retention.ts`, testat).
- Consimțământul pentru păreri include confirmarea vârstei (≥ 16 ani sau acordul părintelui) — Daniel lucrează și cu copii.
- O pagină CMS `privacy` publicată adaugă „Informații suplimentare” la finalul politicii.

**Limite.** Textele sunt redactate tehnic corect față de cod, dar **nu sunt consultanță juridică**; de verificat de un specialist înainte de
lansare. Versiunea în engleză lipsește (rutele `/en/...` dau 404 până există o traducere verificată).

**Regulă de întreținere.** Orice schimbare a prelucrărilor (câmp nou, analytics, furnizor nou, cookie) se reflectă în `content-ro.tsx`
în același PR (vezi AGENTS.md).
