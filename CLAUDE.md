# Instrucțiuni pentru Claude

Regulile de lucru sunt în [`AGENTS.md`](AGENTS.md) — citește-l întâi; nu le duplica aici.

Ordinea de citire la începutul unei sesiuni:
1. `AGENTS.md`
2. `docs/PROJECT_STATE.md` (starea verificată și următoarea acțiune)
3. `docs/PROJECT_BRIEF.md` (doar dacă taskul atinge scope-ul)
4. Deciziile din `docs/decisions/` relevante pentru task
5. Issue-ul GitHub activ

Skill local pentru reluare: `.claude/skills/project-resume/`. Pentru închiderea unei etape: `.claude/skills/stage-validation/`.
