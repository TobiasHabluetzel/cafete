CREATE TYPE "public"."review_status" AS ENUM('pending', 'approved', 'rejected');--> statement-breakpoint
CREATE TABLE "reviews" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"subject" text NOT NULL,
	"locale" varchar(5) NOT NULL,
	"author_name" text NOT NULL,
	"author_email" text,
	"rating" smallint NOT NULL,
	"body" text NOT NULL,
	"status" "review_status" DEFAULT 'pending' NOT NULL,
	"reply_body" text,
	"reply_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"approved_at" timestamp with time zone,
	"ip_hash" text,
	CONSTRAINT "reviews_rating_range" CHECK ("reviews"."rating" between 1 and 5),
	CONSTRAINT "reviews_body_length" CHECK (char_length("reviews"."body") between 10 and 2000),
	CONSTRAINT "reviews_author_name_length" CHECK (char_length("reviews"."author_name") between 2 and 80),
	CONSTRAINT "reviews_locale" CHECK ("reviews"."locale" in ('de', 'en')),
	CONSTRAINT "reviews_reply_paired" CHECK (("reviews"."reply_body" is null) = ("reviews"."reply_at" is null))
);
--> statement-breakpoint
CREATE INDEX "reviews_public_idx" ON "reviews" USING btree ("subject","status","created_at");--> statement-breakpoint
CREATE INDEX "reviews_moderation_idx" ON "reviews" USING btree ("status","created_at");