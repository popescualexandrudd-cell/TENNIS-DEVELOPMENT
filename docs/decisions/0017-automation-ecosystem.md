# 0017 — Automatizări: confirmări, remindere, rezumat, publicare programată (acceptată la cererea lui Daniel, 10.11.2026)

**Context.** Daniel: „întreg website-ul să fie un ecosistem automatizat”. La întrebarea cu opțiuni nu a ales nimic, așa că am ales
automatizările care nu cer servicii plătite și se opresc singure când lipsește configurația. Programările online rămân propunere
pentru o etapă următoare.

**Fluxuri automate.**
| Eveniment | Ce se întâmplă | Unde |
|---|---|---|
| Mesaj de contact | salvare → notificare către Daniel → **confirmare automată** către vizitator (status `autoReply` pe solicitare) | `features/contact/handle.ts` |
| Părere trimisă | salvare „în așteptare” → notificare → confirmare (doar dacă și-a lăsat emailul) → aprobare manuală → homepage | `features/testimonials` |
| Articol cu `scheduledAt` | se publică singur la dată (ultima versiune draft), pagina și sitemap-ul se invalidează | `automation/tasks.ts` |
| Solicitare „Nouă” > N ore (implicit 48) | **un singur reminder** pe email către Daniel (`reminderSentAt`) | `automation/tasks.ts` |
| Luni | **rezumat săptămânal**: solicitări noi / fără răspuns, păreri de aprobat, articole publicate / programate | `automation/tasks.ts` |
| Zilnic | ștergere la termen (retenție, decizia 0013) | `legal/retention.ts` |
| Publicare / retragere / aprobare | invalidare cache + sitemap (deja din etapa 1) | hook-urile colecțiilor |

**Mecanism.** Un singur endpoint, `POST /api/cron` (`Authorization: Bearer CRON_SECRET`, comparare în timp constant; fără secret →
404), apelat de cron-ul serverului la 15 minute. Rulează în runtime-ul Next.js, deci publicarea programată invalidează corect paginile.
Sarcinile zilnice au un marcaj pe zi (Setări site → Automatizări: ultima rulare, rezultat — doar numere). Fiecare automatizare se poate
opri din Setări site. Fără SMTP nu se trimite nimic (nu e eroare).

**De ce nu jobs-urile native Payload.** `schedulePublish` cere coada de joburi și tabele suplimentare; un câmp `scheduledAt` + o sarcină
simplă, testată, e mai ușor de înțeles și de verificat pentru un site personal.

**Verificare.** `tests/int/automation.test.ts`: publicare programată (inclusiv viitor / arhivat), reminder unic, rulare zilnică o dată,
fără SMTP nimic trimis, confirmarea automată, autentificarea endpoint-ului.

**De făcut la lansare.** SMTP (#4), `CRON_SECRET`, intrarea în crontab (RUNBOOK).
