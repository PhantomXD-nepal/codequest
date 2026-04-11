ALTER TABLE "section" DROP COLUMN "language";
ALTER TABLE "section" ADD COLUMN "course_id" text;
ALTER TABLE "section" ADD COLUMN "language_id" text;
ALTER TABLE "section" ADD CONSTRAINT "section_course_id_fkey" FOREIGN KEY ("course_id") REFERENCES "course"("id");
ALTER TABLE "section" ADD CONSTRAINT "section_language_id_fkey" FOREIGN KEY ("language_id") REFERENCES "language"("id");
