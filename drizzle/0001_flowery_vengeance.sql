CREATE TABLE "admin_emails" (
	"email" text PRIMARY KEY NOT NULL,
	"added_by" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
