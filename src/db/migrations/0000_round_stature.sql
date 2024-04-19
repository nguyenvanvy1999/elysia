CREATE TABLE IF NOT EXISTS "account" (
	"user_id" varchar(32) NOT NULL,
	"type" text NOT NULL,
	"provider" text NOT NULL,
	"provider_account_id" text NOT NULL,
	"refresh_token" text,
	"access_token" text,
	"expires_at" integer,
	"token_type" text,
	"scope" text,
	"id_token" text,
	"session_state" text,
	CONSTRAINT "account_provider_provider_account_id_pk" PRIMARY KEY("provider","provider_account_id")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "permission" (
	"id" varchar(32) PRIMARY KEY NOT NULL,
	"action" varchar(256) NOT NULL,
	"entity" varchar(256) NOT NULL,
	"access" varchar(256) NOT NULL,
	"description" text DEFAULT '',
	"created_at" timestamp with time zone DEFAULT now(),
	"updated_at" timestamp with time zone DEFAULT now(),
	CONSTRAINT "permission_action_entity_access_unique" UNIQUE("action","entity","access")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "permission_to_role" (
	"role_id" varchar(32) NOT NULL,
	"permission_id" varchar(32) NOT NULL,
	CONSTRAINT "permission_to_role_role_id_permission_id_pk" PRIMARY KEY("role_id","permission_id")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "roles" (
	"id" varchar(32) PRIMARY KEY NOT NULL,
	"name" varchar(256) NOT NULL,
	"description" text DEFAULT '',
	"created_at" timestamp with time zone DEFAULT now(),
	"updated_at" timestamp with time zone DEFAULT now(),
	CONSTRAINT "roles_name_unique" UNIQUE("name")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "user" (
	"id" varchar(32) PRIMARY KEY NOT NULL,
	"name" text,
	"username" text NOT NULL,
	"email" text NOT NULL,
	"email_verified" timestamp,
	"image" text,
	"password" varchar(256),
	"created_at" timestamp with time zone DEFAULT now(),
	CONSTRAINT "user_username_unique" UNIQUE("username"),
	CONSTRAINT "user_email_unique" UNIQUE("email")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "user_to_role" (
	"role_id" varchar(32) NOT NULL,
	"user_id" varchar(32) NOT NULL,
	CONSTRAINT "user_to_role_role_id_user_id_pk" PRIMARY KEY("role_id","user_id")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "verification_token" (
	"identifier" text NOT NULL,
	"token" text NOT NULL,
	"expires" timestamp NOT NULL,
	CONSTRAINT "verification_token_identifier_token_pk" PRIMARY KEY("identifier","token")
);
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "account" ADD CONSTRAINT "account_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "user"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "permission_to_role" ADD CONSTRAINT "permission_to_role_role_id_roles_id_fk" FOREIGN KEY ("role_id") REFERENCES "roles"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "permission_to_role" ADD CONSTRAINT "permission_to_role_permission_id_permission_id_fk" FOREIGN KEY ("permission_id") REFERENCES "permission"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "user_to_role" ADD CONSTRAINT "user_to_role_role_id_roles_id_fk" FOREIGN KEY ("role_id") REFERENCES "roles"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "user_to_role" ADD CONSTRAINT "user_to_role_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "user"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
