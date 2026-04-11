CREATE TABLE IF NOT EXISTS "language" (
	"id" text PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"title" text NOT NULL,
	"description" text,
	"order" integer DEFAULT 0 NOT NULL,
	CONSTRAINT "language_name_unique" UNIQUE("name")
);
