ALTER TABLE "lesson" DROP COLUMN "video_url";
ALTER TABLE "lesson" DROP COLUMN "language";
ALTER TABLE "course" ADD COLUMN "video_url" text;
ALTER TABLE "course" ADD COLUMN "language" text;
