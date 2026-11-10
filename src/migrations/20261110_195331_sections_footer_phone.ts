import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "pages_locales" ADD COLUMN "home_manifesto_heading" varchar;
  ALTER TABLE "pages_locales" ADD COLUMN "home_manifesto_text" varchar;
  ALTER TABLE "pages_locales" ADD COLUMN "home_about_lead" varchar;
  ALTER TABLE "_pages_v_locales" ADD COLUMN "version_home_manifesto_heading" varchar;
  ALTER TABLE "_pages_v_locales" ADD COLUMN "version_home_manifesto_text" varchar;
  ALTER TABLE "_pages_v_locales" ADD COLUMN "version_home_about_lead" varchar;
  ALTER TABLE "contact_requests" ADD COLUMN "phone" varchar;`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "pages_locales" DROP COLUMN "home_manifesto_heading";
  ALTER TABLE "pages_locales" DROP COLUMN "home_manifesto_text";
  ALTER TABLE "pages_locales" DROP COLUMN "home_about_lead";
  ALTER TABLE "_pages_v_locales" DROP COLUMN "version_home_manifesto_heading";
  ALTER TABLE "_pages_v_locales" DROP COLUMN "version_home_manifesto_text";
  ALTER TABLE "_pages_v_locales" DROP COLUMN "version_home_about_lead";
  ALTER TABLE "contact_requests" DROP COLUMN "phone";`)
}
