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

## Producție (de pregătit — nimic nu este configurat încă)
Cerințe: HTTPS (reverse proxy cu TLS și HSTS), PostgreSQL cu backup separat de server, director media persistent,
procesul Node rulat de un supervizor (systemd sau Docker), `SITE_ENV=production`.
Staging: aceeași configurație, protejat (autentificare la proxy), `SITE_ENV` diferit de `production` (robots `Disallow: /`).

### Docker (fișiere pregătite, **neverificate** — mediul inițial nu avea daemon Docker)
```bash
# 1. pornește baza
POSTGRES_PASSWORD=... docker compose up -d db
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
