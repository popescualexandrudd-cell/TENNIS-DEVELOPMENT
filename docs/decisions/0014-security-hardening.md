# 0014 — Întărirea securității (acceptată la cererea lui Daniel, 10.11.2026)

**Context.** Daniel: „adaugă securitate pe website”.

**Alegere.**
- **Dependențe:** `pnpm audit` găsise 14 vulnerabilități (3 critice). Actualizate: `next` 16.3.8 → 16.4.6 (RCE în optimizatorul de
  imagini, folosit de site), `sharp` 0.35.5, `zod` 4.6.7; `pnpm.overrides` pentru `dompurify` 3.4.17, `happy-dom` 21.0.4, `esbuild ≥ 0.25`
  (dependențe ale Payload). Rămâne 1 vulnerabilitate *low* (`deepmerge` în Payload, fără versiune corectată; folosită doar intern pe
  configurație de încredere). Payload rămâne 3.92.0 (`@payloadcms/next` acceptă `next >=16.3.3 <17`).
- **Antete** (`src/lib/security-headers.ts`): CSP pe origini — totul de pe același domeniu, fără iframe-uri, `object-src 'none'`,
  `frame-ancestors 'none'`, `form-action 'self'`; CSP separată, mai permisivă, pentru `/admin` (Payload are nevoie de eval/inline).
  `X-Frame-Options`, `nosniff`, `Referrer-Policy`, `Permissions-Policy` extinsă, `COOP same-origin`; **HSTS** 2 ani doar pe HTTPS în producție.
- **De ce `'unsafe-inline'` la scripturi:** App Router injectează scripturi inline de hidratare, iar paginile sunt statice (ISR); un nonce
  per cerere ar forța randare dinamică pe fiecare pagină. Compromisul: restricție strictă pe origini, fără conținut HTML introdus de
  vizitatori (formularele salvează text simplu, afișat escapat de React).
- **Administrare:** fără Gravatar (`admin.avatar: 'default'`) — altfel se trimitea un hash al emailului adminului către gravatar.com.
  Autentificarea era deja întărită: 5 încercări, blocare 15 min, cookie HttpOnly + SameSite=Lax + Secure în producție, sesiune 8 h.
- **`/.well-known/security.txt`** (RFC 9116) cu emailul din Setări site.
- Rămase din etapa 1: GraphQL oprit, CSRF/CORS pe domeniu, colecții private fără acces public, IP doar ca hash, rate limit pe formulare,
  honeypot, upload fără SVG, `X-Powered-By` oprit.

**Verificare.** `tests/e2e/security-seo.spec.ts`: antete, zero cookie-uri și zero cereri către terți pe site-ul public, zero încălcări CSP;
administrarea verificată manual cu CSP activă (autentificare, colecții, setări — zero încălcări).

**De făcut la lansare.** TLS la reverse proxy, firewall (doar 80/443 + SSH cu cheie), PostgreSQL neexpus public, backup criptat în altă
locație, `pnpm audit` lunar (sau Dependabot), parolă admin lungă + cont separat pentru editor.
