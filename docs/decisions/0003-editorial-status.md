# 0003 — Status editorial peste drafturile Payload (acceptată, 10.11.2026)

**Context.** Brief-ul cere `draft`, `in_review`, `published`, `archived`, istoric de versiuni, preview privat și separare între
versiunea publicată și modificările nepublicate — fără două surse contradictorii.

**Alegere.** Sursa de adevăr pentru publicare este `_status` nativ Payload (`draft`/`published`, cu versiuni).
Câmpul `workflow` (`draft`, `in_review`, `archived`) descrie doar etapa unui document nepublicat. `editorialStatus` este un
câmp virtual derivat (`src/features/journal/editorial-status.ts`):

| editorialStatus | `_status` | `workflow` |
|---|---|---|
| draft | draft | draft |
| in_review | draft | in_review |
| published | published | (resetat la draft) |
| archived | draft | archived |

Normalizare la salvare: `archived` forțează `_status: draft` (retragere); publicarea resetează `workflow`.

**Verificare.** `tests/unit/editorial-status.test.ts`, `tests/int/articles-access.test.ts` (inclusiv: draft invizibil public cu
`draft=true`, după ID, prin versiuni; modificări nepublicate invizibile; arhivarea retrage), `tests/e2e/editorial.spec.ts` (prin REST
și pagini, cu invalidarea cache-ului).

**Alternative respinse.** Un select propriu de status fără drafturi Payload (pierdem versiunile și separarea publicat/nepublicat);
`localizeStatus` experimental.

**Reconsiderare.** Dacă Payload oferă nativ etape de workflow configurabile.
