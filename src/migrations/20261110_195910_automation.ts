import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   CREATE TYPE "public"."enum_contact_requests_auto_reply" AS ENUM('sent', 'failed');
  ALTER TABLE "articles" ADD COLUMN "scheduled_at" timestamp(3) with time zone;
  ALTER TABLE "_articles_v" ADD COLUMN "version_scheduled_at" timestamp(3) with time zone;
  ALTER TABLE "contact_requests" ADD COLUMN "auto_reply" "enum_contact_requests_auto_reply";
  ALTER TABLE "contact_requests" ADD COLUMN "reminder_sent_at" timestamp(3) with time zone;
  ALTER TABLE "site_settings" ADD COLUMN "automation_auto_reply" boolean DEFAULT true;
  ALTER TABLE "site_settings" ADD COLUMN "automation_reminders" boolean DEFAULT true;
  ALTER TABLE "site_settings" ADD COLUMN "automation_reminder_hours" numeric DEFAULT 48 NOT NULL;
  ALTER TABLE "site_settings" ADD COLUMN "automation_weekly_digest" boolean DEFAULT true;
  ALTER TABLE "site_settings" ADD COLUMN "automation_last_run_at" timestamp(3) with time zone;
  ALTER TABLE "site_settings" ADD COLUMN "automation_last_daily_run_on" varchar;
  ALTER TABLE "site_settings" ADD COLUMN "automation_last_digest_on" varchar;
  ALTER TABLE "site_settings" ADD COLUMN "automation_last_result" varchar;`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "articles" DROP COLUMN "scheduled_at";
  ALTER TABLE "_articles_v" DROP COLUMN "version_scheduled_at";
  ALTER TABLE "contact_requests" DROP COLUMN "auto_reply";
  ALTER TABLE "contact_requests" DROP COLUMN "reminder_sent_at";
  ALTER TABLE "site_settings" DROP COLUMN "automation_auto_reply";
  ALTER TABLE "site_settings" DROP COLUMN "automation_reminders";
  ALTER TABLE "site_settings" DROP COLUMN "automation_reminder_hours";
  ALTER TABLE "site_settings" DROP COLUMN "automation_weekly_digest";
  ALTER TABLE "site_settings" DROP COLUMN "automation_last_run_at";
  ALTER TABLE "site_settings" DROP COLUMN "automation_last_daily_run_on";
  ALTER TABLE "site_settings" DROP COLUMN "automation_last_digest_on";
  ALTER TABLE "site_settings" DROP COLUMN "automation_last_result";
  DROP TYPE "public"."enum_contact_requests_auto_reply";`)
}
