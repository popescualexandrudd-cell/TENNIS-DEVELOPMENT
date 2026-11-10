import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   CREATE TYPE "public"."enum_site_settings_legal_entity_type" AS ENUM('individual', 'pfa', 'company');
  ALTER TABLE "site_settings" ADD COLUMN "legal_entity_type" "enum_site_settings_legal_entity_type" DEFAULT 'individual' NOT NULL;
  ALTER TABLE "site_settings" ADD COLUMN "legal_legal_name" varchar;
  ALTER TABLE "site_settings" ADD COLUMN "legal_tax_id" varchar;
  ALTER TABLE "site_settings" ADD COLUMN "legal_trade_register" varchar;
  ALTER TABLE "site_settings" ADD COLUMN "legal_address" varchar;
  ALTER TABLE "site_settings" ADD COLUMN "legal_privacy_email" varchar;
  ALTER TABLE "site_settings" ADD COLUMN "legal_hosting_provider" varchar;
  ALTER TABLE "site_settings" ADD COLUMN "legal_email_provider" varchar;
  ALTER TABLE "site_settings" ADD COLUMN "legal_outside_e_e_a" boolean DEFAULT false;
  ALTER TABLE "site_settings" ADD COLUMN "legal_transfer_safeguards" varchar;
  ALTER TABLE "site_settings" ADD COLUMN "legal_contact_retention_months" numeric DEFAULT 12 NOT NULL;
  ALTER TABLE "site_settings" ADD COLUMN "legal_feedback_retention_months" numeric DEFAULT 6 NOT NULL;
  ALTER TABLE "site_settings" ADD COLUMN "legal_updated_on" timestamp(3) with time zone;`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "site_settings" DROP COLUMN "legal_entity_type";
  ALTER TABLE "site_settings" DROP COLUMN "legal_legal_name";
  ALTER TABLE "site_settings" DROP COLUMN "legal_tax_id";
  ALTER TABLE "site_settings" DROP COLUMN "legal_trade_register";
  ALTER TABLE "site_settings" DROP COLUMN "legal_address";
  ALTER TABLE "site_settings" DROP COLUMN "legal_privacy_email";
  ALTER TABLE "site_settings" DROP COLUMN "legal_hosting_provider";
  ALTER TABLE "site_settings" DROP COLUMN "legal_email_provider";
  ALTER TABLE "site_settings" DROP COLUMN "legal_outside_e_e_a";
  ALTER TABLE "site_settings" DROP COLUMN "legal_transfer_safeguards";
  ALTER TABLE "site_settings" DROP COLUMN "legal_contact_retention_months";
  ALTER TABLE "site_settings" DROP COLUMN "legal_feedback_retention_months";
  ALTER TABLE "site_settings" DROP COLUMN "legal_updated_on";
  DROP TYPE "public"."enum_site_settings_legal_entity_type";`)
}
