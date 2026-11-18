# Runbook — instalare, operare, backup, restaurare, rollback

## Local (verificat pe 10.11.2026: Ubuntu 24.04, Node 22.23.4, pnpm 10.28.0, PostgreSQL 16.15)
```bash
sudo -u postgres psql -c "CREATE USER dp WITH PASSWORD 'dp_local_dev' CREATEDB;"
sudo -u postgres createdb -O dp dp_web
sudo -u postgres createdb -O dp dp_web_test     # pentru pnpm test:int
pnpm install
cp .env.example .env    # completează PAYLOAD_SECRET și CONTACT_HASH_SECRET: openssl rand -hex 32
pnpm migrate
pnpm seed:dev           # opțional, doar local
pnpm dev
```
Primul cont din `/admin` devine automat administrator (sau folosește contul din seed).

## Variabile de mediu
Lista completă și explicații: `.env.example`. Obligatorii în producție: `DATABASE_URL`, `PAYLOAD_SECRET`,
`NEXT_PUBLIC_SITE_URL`, `CONTACT_HASH_SECRET`, `SITE_ENV=production` (activează indexarea în `robots.txt`).
Email: `SMTP_*`, `EMAIL_FROM_*`, `CONTACT_NOTIFY_TO`. Media: `MEDIA_DIR` (director persistent).

## Migrații
- Schemă nouă: modifici colecțiile → `pnpm migrate:create <nume>` → comiți `src/migrations/*` → `pnpm migrate`.
- În producție (`NODE_ENV=production`) migrațiile din `src/migrations/index.ts` rulează automat la pornire.
- `push` (sincronizarea automată a schemei) este dezactivat peste tot, ca dezvoltarea să fie reproductibilă.

## Email
Orice furnizor SMTP. Fără SMTP, solicitările se salvează cu notificare „Eșuată” și motivul;
după configurare, în admin → Solicitări → bifează „Retrimite notificarea la salvare” → Save.
Verificare înainte de lansare: o solicitare de test trebuie să ajungă la `CONTACT_NOTIFY_TO` (inclusiv în spam check).

## Publicare pe VPS
Cerințe: HTTPS (reverse proxy cu TLS și HSTS), PostgreSQL cu backup separat de server, director media persistent,
procesul Node rulat de un supervizor (systemd sau Docker), `SITE_ENV=production`.
Preview-ul de pe VPS rulează ca build Next.js standalone prin `tennis-site-preview.service`, cu PostgreSQL
și HTTPS protejat prin `tennis-preview-https.service`. În staging setăm `SITE_ENV` diferit de `production`
(robots `Disallow: /`).

- [CI pentru revizia preview `928cc3c`](https://github.com/popescualexandrudd-cell/TENNIS-DEVELOPMENT/actions/runs/44097277942):
  instalare, lint, TypeScript, Vitest, migrații pe o bază de test, build Turbopack și Playwright.
- Verificare pe VPS: `systemctl status tennis-site-preview.service tennis-preview-https.service`,
  `curl -fsS http://127.0.0.1:3100/ro -o /dev/null`, apoi deschide pagina prin HTTPS și autentifică-te în CMS.

Pentru lansare, confirmă domeniul canonic și direcționează înregistrarea DNS către VPS. Pregătește release-ul
cu `NEXT_PUBLIC_SITE_URL` setat la originea HTTPS finală. Folosește o bază și un director media de producție,
iar datele pentru lansare trebuie verificate înainte de import. Activează ruta Caddy pentru domeniu după
validarea configurației, verificarea certificatului și confirmarea aplicației pe portul său local.

### Înainte de lansare — legal, securitate, SEO (deciziile 0013–0015)
- [ ] Setări site → **Date legale** completate (paginile legale nu apar în producție fără ele); textele verificate de un specialist.
- [ ] `pnpm retention` programat zilnic (șterge datele la termenele din politică). Configurează jobul în directorul sursă al release-ului, cu mediul și contul aplicației..
- [ ] TLS la reverse proxy; `NEXT_PUBLIC_SITE_URL=https://…` (activează HSTS și `upgrade-insecure-requests`).
- [ ] Firewall: doar 80/443 public, SSH cu cheie; PostgreSQL ascultă doar local; backup criptat în altă locație.
- [ ] `pnpm audit --prod` fără vulnerabilități high/critical; apoi lunar.
- [ ] Email în Setări site (pentru `/.well-known/security.txt`) și SMTP (#4).
- [ ] Google Search Console: verificare domeniu, trimitere `sitemap.xml`; test imagine OG cu un link distribuit.

### Docker

[Verificat pe Ubuntu în GitHub Actions](https://github.com/popescualexandrudd-cell/TENNIS-DEVELOPMENT/actions/runs/44290779149):
PostgreSQL în Compose, migrații și seed cu date sintetice, build al imaginii, pornirea serviciului și `GET /ro` cu HTTP 200.
```bash
# 1. pornește baza
docker compose up -d --wait db
# 2. build cu acces la bază (paginile se pre-randează din DB)
docker build --network host \
  --build-arg DATABASE_URL=postgresql://dp:...@localhost:5432/dp_web \
  --build-arg NEXT_PUBLIC_SITE_URL=https://domeniu.ro -t dp-web:latest .
# 3. pornește aplicația (migrațiile rulează la start)
docker compose up -d app
```

## Backup
```bash
DATABASE_URL=... MEDIA_DIR=./media BACKUP_DIR=./backups scripts/backup.sh
```
Produce `backups/<UTC>/db.dump` (pg_dump custom), `media.tar.gz`, `SHA256SUMS`. Copiază rezultatul în altă locație
(alt server / stocare externă). Frecvență propusă: zilnic, păstrare 14 zile + lunar 6 luni (de decis la alegerea gazdei).

## Restaurare
```bash
DATABASE_URL=<baza țintă> MEDIA_DIR=<media țintă> scripts/restore.sh backups/<UTC>     # cere confirmare „da”
```
**Test de restaurare efectuat** (10.11.2026, local): backup din `dp_web` → restaurare în baza nouă `dp_restore_check`
→ număr identic de rânduri (3 articole, 1 pagină, 2 solicitări, 1 migrație) și media extrasă. De repetat în mediul real
după configurarea gazdei, apoi trimestrial.

## Actualizare și rollback
1. Backup (comanda de mai sus).
2. Deploy versiunea nouă (tag Git). Migrațiile rulează la pornire.
3. Verificare: `/ro` 200, `/admin` login, trimitere formular de test, un articol publicat se deschide.
4. Rollback cod: redeploy tagul anterior. Dacă versiunea nouă a avut migrații: `pnpm payload migrate:down` (o migrație)
   sau, în caz de problemă de date, restaurare din backup-ul de la pasul 1.

## Loguri
Payload/Next loghează în stdout. Logurile aplicației nu conțin conținutul mesajelor de contact; erorile de email includ doar ID-ul solicitării.
