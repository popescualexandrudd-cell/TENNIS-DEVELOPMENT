# 0012 — Păreri trimise de sportivi, cu aprobare (acceptată la cererea lui Daniel, 10.11.2026)

**Context.** Daniel: „creează o bază de date pentru utilizatorii care vizitează website-ul, pentru «Ce spun sportivii» o să vreau să aibă
posibilitatea”. Alegeri (întrebare cu opțiuni): **formular + aprobare** (fără conturi) și **oricine vizitează site-ul** poate trimite.

**Alegere.**
- Colecție nouă `testimonials` (PostgreSQL, migrația `20261110_142643_testimonials_submissions`): nume, context, părere, `consent` +
  `consentText` (textul acordului, salvat de server în limba formularului), email opțional, `status` (`pending` implicit), `language`,
  `approvedAt`, `ipHash`.
- `POST /api/feedback` (`src/features/testimonials/handle.ts`): aceeași protecție ca la contact (origine, JSON, mărime ≤ 8 KB, Zod,
  honeypot), acord obligatoriu, limită **2 păreri/oră/IP** (hash HMAC, fără IP brut), notificare email opțională către Daniel.
- Acces: publicul citește doar `approved`, iar emailul, hash-ul IP și textul acordului nu sunt citibile public (acces pe câmp). Nimeni
  nu creează direct prin REST. Editorii și adminii moderează (status „Aprobată” / „Respinsă”); aprobarea invalidează homepage-ul.
- Homepage, „Ce spun jucătorii”: întâi testimonialele introduse de Daniel în CMS (cu acord), apoi părerile aprobate, max. 6.
  Formularul e într-un `<details>` „Lasă o părere” (fără JavaScript pentru deschidere). Se poate opri din Setări site → „Sportivii pot trimite păreri”.
- Fără conturi de utilizator: nu stocăm parole, nu e nevoie de email de confirmare; date minime (GDPR: consimțământ, retragere la cerere).

**Alternative respinse.** Conturi de sportiv (parole, resetare, confirmare email, mai multe obligații); doar invitații (Daniel a ales formular public).
Publicare automată (risc de spam / recenzii false — o părere publică trebuie citită de un om).

**Verificare.** `tests/int/testimonials.test.ts` (salvare în așteptare, acord, validare, honeypot, origine, limită, fără IP brut,
formular oprit, aprobare → public fără câmpuri private, respingere, creare directă interzisă); e2e: formular pe homepage.

**De făcut la lansare.** Informarea de confidențialitate (secțiunea „păreri”), retenția pentru părerile neaprobate, email SMTP pentru notificări.
