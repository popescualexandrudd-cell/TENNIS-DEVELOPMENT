# 0004 — Contact: persistență înaintea emailului; rate limit în PostgreSQL (acceptată, 10.11.2026)

**Alegere.** `POST /api/contact`: verificare Origin + `Content-Type` + limită 16 KB → Zod → honeypot → max 3 solicitări / 10 minute
per hash HMAC al IP-ului (numărate în `contact_requests`) → salvare → email. Răspuns 201 doar după salvare; eșecul emailului
este înregistrat (`notificationStatus`, `notificationError`) și poate fi retrimis din admin.

**Motiv.** Nicio solicitare pierdută din cauza emailului; limitarea funcționează identic cu mai multe instanțe, fără Redis.
IP-ul brut nu se stochează.

**Alternative respinse.** Rate limit în memorie (inconsecvent între instanțe); CAPTCHA extern (date către terți, fricțiune);
email înainte de salvare.

**Consecințe.** Hash-ul IP este date pseudonime: se menționează în informarea de confidențialitate și se aplică retenția.

**Reconsiderare.** Spam persistent → Turnstile/hCaptcha sau rate limit la proxy.
