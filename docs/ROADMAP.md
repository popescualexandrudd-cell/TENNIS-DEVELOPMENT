# Roadmap

Etapele urmează una după alta; magazinul poate apărea între Etapa 1.1 și Etapa 2. Fiecare etapă are o poartă de trecere.
Taskurile concrete sunt în GitHub Issues (milestone-ul etapei); aici rămân doar direcția și criteriile.

## Etapa 1 — Website și jurnal (activă)

| Poartă | Condiția de trecere | Stare |
|---|---|---|
| Conținut și scope | Brief clar, servicii confirmate sau marcate intern, limitele MVP stabilite | parțial — lipsesc datele de la Daniel |
| Design | Homepage desktop/mobil prezentat; direcție și navigație validate de Daniel | prezentat, **așteaptă validare** |
| Fundație tehnică | Pornire locală, CMS + PostgreSQL funcționale, migrare reproductibilă | verificat local |
| Website | Pagini, navigație, mobil, jurnal funcționale | implementat, verificat local cu date de seed |
| Fluxuri reale | Drafturi protejate, publicare, contact persistent cu erori tratate | verificat local; email SMTP neconfigurat |
| Pregătire lansare | Verificări trecute, conținut real, configurații, recuperare | neînceput |
| Lansare | Publicare autorizată și verificări în mediul real | neînceput |

## Etapa 1.1 — Proces editorial
1. Instrucțiuni reutilizabile pentru redactarea cu Claude (`docs/EDITORIAL_GUIDE.md` — existent).
2. Import de drafturi (JSON validat → CMS, status `draft`).
3. Ulterior: integrare API cu output structurat validat, limite de cost, deduplicare, istoric generare;
   contul automat creează doar drafturi; fetching doar din surse permise, cu protecție SSRF.
4. Newsletter numai după un ritm editorial stabil și un motiv clar de abonare.

## Magazin propriu (când există produse, furnizori și capacitate de livrare)
Fără Shopify. Modulul se proiectează la activare; acum nu există tabele sau endpoint-uri.
Trebuie să acopere: produse și variante (mărime, culoare, SKU), media și ghid de mărimi, prețuri/taxe/monede, stoc cu rezervări
temporare, coș, checkout, comenzi, plăți, facturare, expediere și tracking, anulări, retururi, rambursări, istoric al operațiunilor.

Principii: procesator de plăți cu integrare oficială (fără date complete de card pe serverul nostru); adaptoare înlocuibile pentru
plăți, curieri, facturare; stările comenzii, plății și expedierii separate; prevenirea supravânzării tranzacțional;
webhookuri verificate, idempotente, tolerante la duplicate și ordine diferită; expirarea rezervărilor neplătite; reconciliere;
confirmarea plății pe baza procesatorului, nu a paginii de succes. Flux: comandă → plată confirmată → alocare stoc → pregătire →
expediere → livrare → (retur). Un retur fizic nu este automat o rambursare.
Înainte de lansare: responsabil, timp de pregătire, stoc real, politică de retur, procedură de livrare testată practic.

## Etapa 2 — Aplicație de tenis
Produs separat, cu domeniu de date și autentificare proprii (nu extensie a CMS-ului). Pornește de la o nevoie validată în discuții
cu utilizatori reali; un singur flux valoros în MVP; util fără senzori; comparație web vs. mobil; API-uri versionate;
protecția minorilor când publicul o cere.

## Etapa finală — Senzori
Un singur caz de utilizare; mărimi măsurate separate de estimări; protocol de test și referință de validare;
BLE, sincronizare, calibrare, firmware, autonomie, ergonomie evaluate în R&D; suportul real al platformelor mobile verificat.
Fără promisiuni despre viteza mingii, precizie biomecanică sau prevenirea accidentărilor înainte de validare.

## Opțional, oricând după lansare
O scenă 3D mică (Blender → glTF → React Three Fiber), încărcată dinamic, cu imagine statică de rezervă — numai dacă aduce valoare
și nu afectează performanța.
