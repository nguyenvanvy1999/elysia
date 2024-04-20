CREATE TABLE IF NOT EXISTS "refresh_token" (
	"id" varchar(32) NOT NULL,
	"token" text NOT NULL,
	"expires" timestamp NOT NULL,
	CONSTRAINT "refresh_token_id_token_id_pk" PRIMARY KEY("id","token","id")
);
--> statement-breakpoint
DROP TABLE "account";--> statement-breakpoint
DROP TABLE "verification_token";