import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   CREATE TYPE "public"."enum_testimonials_status" AS ENUM('pending', 'approved', 'rejected');
  CREATE TYPE "public"."enum_testimonials_language" AS ENUM('ro', 'en');
  CREATE TABLE "testimonials" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"name" varchar NOT NULL,
  	"role" varchar,
  	"quote" varchar NOT NULL,
  	"consent" boolean DEFAULT false NOT NULL,
  	"consent_text" varchar,
  	"email" varchar,
  	"status" "enum_testimonials_status" DEFAULT 'pending' NOT NULL,
  	"language" "enum_testimonials_language" DEFAULT 'ro',
  	"approved_at" timestamp(3) with time zone,
  	"ip_hash" varchar,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  ALTER TABLE "payload_locked_documents_rels" ADD COLUMN "testimonials_id" integer;
  ALTER TABLE "site_settings" ADD COLUMN "accept_testimonials" boolean DEFAULT true;
  CREATE INDEX "testimonials_status_idx" ON "testimonials" USING btree ("status");
  CREATE INDEX "testimonials_ip_hash_idx" ON "testimonials" USING btree ("ip_hash");
  CREATE INDEX "testimonials_updated_at_idx" ON "testimonials" USING btree ("updated_at");
  CREATE INDEX "testimonials_created_at_idx" ON "testimonials" USING btree ("created_at");
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_testimonials_fk" FOREIGN KEY ("testimonials_id") REFERENCES "public"."testimonials"("id") ON DELETE cascade ON UPDATE no action;
  CREATE INDEX "payload_locked_documents_rels_testimonials_id_idx" ON "payload_locked_documents_rels" USING btree ("testimonials_id");`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "testimonials" DISABLE ROW LEVEL SECURITY;
  DROP TABLE "testimonials" CASCADE;
  ALTER TABLE "payload_locked_documents_rels" DROP CONSTRAINT "payload_locked_documents_rels_testimonials_fk";
  
  DROP INDEX "payload_locked_documents_rels_testimonials_id_idx";
  ALTER TABLE "payload_locked_documents_rels" DROP COLUMN "testimonials_id";
  ALTER TABLE "site_settings" DROP COLUMN "accept_testimonials";
  DROP TYPE "public"."enum_testimonials_status";
  DROP TYPE "public"."enum_testimonials_language";`)
}
