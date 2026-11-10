# Instrumente efectiv folosite

Verificat la 10.11.2026. Costurile serviciilor externe **nu au putut fi verificate online** din mediul de lucru (rețea restricționată);
se verifică pe site-ul oficial înainte de activare. Nimic plătit nu este activat.

## Software open-source (gratuit)
| Instrument | Scop | Licență | Note |
|---|---|---|---|
| Next.js, React | framework web | MIT | |
| Payload CMS + `@payloadcms/*` | administrare, API, migrații | MIT | GraphQL dezactivat |
| PostgreSQL 16 | bază de date | PostgreSQL License | gazduirea se bugetează separat |
| Tailwind CSS 4, Zod, sharp, nodemailer | stiluri, validare, imagini, email | MIT / Apache-2.0 | |
| Manrope, Source Sans 3 | fonturi | SIL OFL 1.1 | găzduite local |
| Vitest, Playwright, axe-core | teste | MIT / Apache-2.0 / MPL-2.0 | rulare locală și în CI |
| fontTools (Python) | verificare diacritice în fonturi | MIT | folosit o dată, local |

## Servicii (planuri gratuite cu limite)
| Serviciu | Scop | Date accesate | Cum se dezactivează | Risc de cost |
|---|---|---|---|---|
| GitHub (repository privat, Issues, PR) | cod și planificare | codul | — | limitele planului Free |
| GitHub Actions | CI (`.github/workflows/ci.yml`) | codul, date sintetice | ștergi / dezactivezi workflow-ul | minutele incluse pentru repo-uri private sunt limitate; setează bugetul de cheltuieli la 0 în Settings → Billing |

## Propuse, NEactivate (necesită decizie)
| Serviciu | Rol | Date transmise | Alternativă / înlocuire |
|---|---|---|---|
| Plausible Analytics (cloud plătit sau Community Edition self-hosted) | măsurare de bază fără cookies | URL, referrer, tip dispozitiv, țară (fără IP stocat, fără date din formular) | Umami self-hosted; se activează doar prin `NEXT_PUBLIC_PLAUSIBLE_DOMAIN` |
| Furnizor SMTP (ex. cel al domeniului) | notificări contact | numele, emailul, mesajul solicitării → către adresa lui Daniel | orice SMTP; schimbi variabilele `SMTP_*` |
| Gazduire (VPS sau PaaS cu Node + PostgreSQL) | producție | toate | portabil prin Docker / Node |
| Google Search Console | indexare | — | se conectează doar cu acces real la domeniu |

## Instrumente ale mediului de dezvoltare (sesiunea Claude Code)
Folosite: Bash, editor de fișiere, Playwright preinstalat (capturi, teste), integrarea GitHub a mediului (branch, PR, Issues).
Indisponibile în sesiunea inițială: fetch web către site-urile de referință (DNS blocat), daemon Docker, câteva servere MCP
(conexiuni eșuate). Nu s-au instalat pluginuri sau servere MCP noi.
