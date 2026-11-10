import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   CREATE TABLE "pages_home_facts" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"value" varchar,
  	"label" varchar,
  	"note" varchar
  );
  
  CREATE TABLE "pages_home_testimonials" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"name" varchar,
  	"role" varchar,
  	"quote" varchar,
  	"image_id" integer,
  	"consent" boolean DEFAULT false
  );
  
  CREATE TABLE "_pages_v_version_home_facts" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"value" varchar,
  	"label" varchar,
  	"note" varchar,
  	"_uuid" varchar
  );
  
  CREATE TABLE "_pages_v_version_home_testimonials" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"name" varchar,
  	"role" varchar,
  	"quote" varchar,
  	"image_id" integer,
  	"consent" boolean DEFAULT false,
  	"_uuid" varchar
  );
  
  ALTER TABLE "pages_locales" ADD COLUMN "home_about_heading" varchar;
  ALTER TABLE "pages_locales" ADD COLUMN "home_coaching_heading" varchar;
  ALTER TABLE "_pages_v_locales" ADD COLUMN "version_home_about_heading" varchar;
  ALTER TABLE "_pages_v_locales" ADD COLUMN "version_home_coaching_heading" varchar;
  ALTER TABLE "coaching_services" ADD COLUMN "image_id" integer;
  ALTER TABLE "pages_home_facts" ADD CONSTRAINT "pages_home_facts_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_home_testimonials" ADD CONSTRAINT "pages_home_testimonials_image_id_media_id_fk" FOREIGN KEY ("image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "pages_home_testimonials" ADD CONSTRAINT "pages_home_testimonials_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_version_home_facts" ADD CONSTRAINT "_pages_v_version_home_facts_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_version_home_testimonials" ADD CONSTRAINT "_pages_v_version_home_testimonials_image_id_media_id_fk" FOREIGN KEY ("image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_pages_v_version_home_testimonials" ADD CONSTRAINT "_pages_v_version_home_testimonials_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v"("id") ON DELETE cascade ON UPDATE no action;
  CREATE INDEX "pages_home_facts_order_idx" ON "pages_home_facts" USING btree ("_order");
  CREATE INDEX "pages_home_facts_parent_id_idx" ON "pages_home_facts" USING btree ("_parent_id");
  CREATE INDEX "pages_home_facts_locale_idx" ON "pages_home_facts" USING btree ("_locale");
  CREATE INDEX "pages_home_testimonials_order_idx" ON "pages_home_testimonials" USING btree ("_order");
  CREATE INDEX "pages_home_testimonials_parent_id_idx" ON "pages_home_testimonials" USING btree ("_parent_id");
  CREATE INDEX "pages_home_testimonials_locale_idx" ON "pages_home_testimonials" USING btree ("_locale");
  CREATE INDEX "pages_home_testimonials_image_idx" ON "pages_home_testimonials" USING btree ("image_id");
  CREATE INDEX "_pages_v_version_home_facts_order_idx" ON "_pages_v_version_home_facts" USING btree ("_order");
  CREATE INDEX "_pages_v_version_home_facts_parent_id_idx" ON "_pages_v_version_home_facts" USING btree ("_parent_id");
  CREATE INDEX "_pages_v_version_home_facts_locale_idx" ON "_pages_v_version_home_facts" USING btree ("_locale");
  CREATE INDEX "_pages_v_version_home_testimonials_order_idx" ON "_pages_v_version_home_testimonials" USING btree ("_order");
  CREATE INDEX "_pages_v_version_home_testimonials_parent_id_idx" ON "_pages_v_version_home_testimonials" USING btree ("_parent_id");
  CREATE INDEX "_pages_v_version_home_testimonials_locale_idx" ON "_pages_v_version_home_testimonials" USING btree ("_locale");
  CREATE INDEX "_pages_v_version_home_testimonials_image_idx" ON "_pages_v_version_home_testimonials" USING btree ("image_id");
  ALTER TABLE "coaching_services" ADD CONSTRAINT "coaching_services_image_id_media_id_fk" FOREIGN KEY ("image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  CREATE INDEX "coaching_services_image_idx" ON "coaching_services" USING btree ("image_id");`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "pages_home_facts" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "pages_home_testimonials" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_pages_v_version_home_facts" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_pages_v_version_home_testimonials" DISABLE ROW LEVEL SECURITY;
  DROP TABLE "pages_home_facts" CASCADE;
  DROP TABLE "pages_home_testimonials" CASCADE;
  DROP TABLE "_pages_v_version_home_facts" CASCADE;
  DROP TABLE "_pages_v_version_home_testimonials" CASCADE;
  ALTER TABLE "coaching_services" DROP CONSTRAINT "coaching_services_image_id_media_id_fk";
  
  DROP INDEX "coaching_services_image_idx";
  ALTER TABLE "pages_locales" DROP COLUMN "home_about_heading";
  ALTER TABLE "pages_locales" DROP COLUMN "home_coaching_heading";
  ALTER TABLE "_pages_v_locales" DROP COLUMN "version_home_about_heading";
  ALTER TABLE "_pages_v_locales" DROP COLUMN "version_home_coaching_heading";
  ALTER TABLE "coaching_services" DROP COLUMN "image_id";`)
}
