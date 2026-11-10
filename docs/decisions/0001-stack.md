# 0001 — Stack: Next.js + Payload + PostgreSQL (acceptată, 10.11.2026)

**Context.** Website personal cu jurnal, administrare, două limbi, control total asupra codului și datelor, găzduire portabilă.

**Alegere.** O singură aplicație: Next.js 16.3.8 (App Router) + Payload 3.92.0 (în același proces) + PostgreSQL 16 prin
`@payloadcms/db-postgres` (Drizzle intern, migrații Payload). React 19.2.9, TypeScript 5.9 strict, Tailwind 4.3, Zod 4.3.
Media pe disc local; email prin SMTP (nodemailer). Fără al doilea ORM.

**Motiv versiuni.** Cele mai noi versiuni stabile aflate în intervalul de compatibilitate declarat de Payload
(`next >=16.3.3 <17`) și lansate cu cel puțin ~2 săptămâni înainte (Payload 3.93.0 și Next 16.4.6 erau de 6 zile, respectiv 1 zi).
Template-ul oficial Payload 3.92 folosește Next 16.3.x. Fără alpha/beta.

**Alternative respinse.** CMS headless SaaS (dependență proprietară); WordPress (stack diferit, plugin-uri, întreținere);
Astro + CMS separat (două aplicații pentru un site mic); Prisma în paralel cu Payload (două surse de schemă).

**Consecințe.** Build-ul pre-randează din DB (DB accesibilă la build). Upgrade-urile Payload și Next trebuie făcute împreună,
respectând intervalul peer. Fișierele din `src/app/(payload)` sunt generate.

**Reconsiderare.** Dacă Payload abandonează PostgreSQL sau Next App Router, sau dacă administrarea devine un produs separat.
