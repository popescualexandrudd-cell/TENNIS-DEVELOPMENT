import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "pages_home_method" ADD COLUMN "media_id" integer;
  ALTER TABLE "_pages_v_version_home_method" ADD COLUMN "media_id" integer;
  ALTER TABLE "media" ADD COLUMN "poster_id" integer;
  ALTER TABLE "pages_home_method" ADD CONSTRAINT "pages_home_method_media_id_media_id_fk" FOREIGN KEY ("media_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_pages_v_version_home_method" ADD CONSTRAINT "_pages_v_version_home_method_media_id_media_id_fk" FOREIGN KEY ("media_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "media" ADD CONSTRAINT "media_poster_id_media_id_fk" FOREIGN KEY ("poster_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  CREATE INDEX "pages_home_method_media_idx" ON "pages_home_method" USING btree ("media_id");
  CREATE INDEX "_pages_v_version_home_method_media_idx" ON "_pages_v_version_home_method" USING btree ("media_id");
  CREATE INDEX "media_poster_idx" ON "media" USING btree ("poster_id");`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "pages_home_method" DROP CONSTRAINT "pages_home_method_media_id_media_id_fk";
  
  ALTER TABLE "_pages_v_version_home_method" DROP CONSTRAINT "_pages_v_version_home_method_media_id_media_id_fk";
  
  ALTER TABLE "media" DROP CONSTRAINT "media_poster_id_media_id_fk";
  
  DROP INDEX "pages_home_method_media_idx";
  DROP INDEX "_pages_v_version_home_method_media_idx";
  DROP INDEX "media_poster_idx";
  ALTER TABLE "pages_home_method" DROP COLUMN "media_id";
  ALTER TABLE "_pages_v_version_home_method" DROP COLUMN "media_id";
  ALTER TABLE "media" DROP COLUMN "poster_id";`)
}
