DO $$ BEGIN
 CREATE TYPE "public"."setting_type_enum" AS ENUM('string', 'number', 'boolean', 'json', 'date');
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 CREATE TYPE "public"."user_status_enum" AS ENUM('active', 'inactive', 'inactive_permanent', 'block');
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "device" (
	"id" varchar(32) PRIMARY KEY NOT NULL,
	"user_id" varchar(32),
	"session_id" varchar,
	"type" varchar,
	"vendor" varchar,
	"model" varchar,
	"os" varchar,
	"os_version" varchar,
	"ua" varchar NOT NULL,
	"browser_name" varchar,
	"browser_version" varchar,
	"engine_name" varchar,
	"engine_version" varchar,
	"cpu_architecture" varchar,
	"created_at" timestamp with time zone DEFAULT now(),
	"login_at" timestamp,
	"logout_at" timestamp,
	"location" jsonb,
	"login_method" varchar,
	"address" varchar,
	"ip_address" varchar
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
CREATE TABLE IF NOT EXISTS "refresh_token" (
	"id" varchar(32) PRIMARY KEY NOT NULL,
	"user_id" varchar(32) NOT NULL,
	"token" text NOT NULL,
	"expires" timestamp NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "role" (
	"id" varchar(32) PRIMARY KEY NOT NULL,
	"name" varchar(256) NOT NULL,
	"description" text DEFAULT '',
	"created_at" timestamp with time zone DEFAULT now(),
	"updated_at" timestamp with time zone DEFAULT now(),
	CONSTRAINT "role_name_unique" UNIQUE("name")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "setting" (
	"id" varchar(32) PRIMARY KEY NOT NULL,
	"key" text NOT NULL,
	"is_encrypted" boolean DEFAULT false,
	"description" text,
	"type" "setting_type_enum" NOT NULL,
	"value" varchar(2048) NOT NULL,
	CONSTRAINT "setting_key_unique" UNIQUE("key")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "translation" (
	"lang" text NOT NULL,
	"ns" text NOT NULL,
	"key" text NOT NULL,
	"value" text NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "user" (
	"id" varchar(32) PRIMARY KEY NOT NULL,
	"name" text,
	"username" text NOT NULL,
	"email" text NOT NULL,
	"email_verified" timestamp,
	"avatar_url" text,
	"password" varchar(256) NOT NULL,
	"password_created" timestamp NOT NULL,
	"password_expired" timestamp NOT NULL,
	"password_attempt" integer NOT NULL,
	"password_salt" varchar NOT NULL,
	"status" "user_status_enum" DEFAULT 'active' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now(),
	"updated_at" timestamp with time zone DEFAULT now(),
	"active_account_token" varchar,
	"active_account_at" timestamp with time zone,
	"magic_login_token" varchar,
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
DO $$ BEGIN
 ALTER TABLE "permission_to_role" ADD CONSTRAINT "permission_to_role_role_id_role_id_fk" FOREIGN KEY ("role_id") REFERENCES "public"."role"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "permission_to_role" ADD CONSTRAINT "permission_to_role_permission_id_permission_id_fk" FOREIGN KEY ("permission_id") REFERENCES "public"."permission"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "user_to_role" ADD CONSTRAINT "user_to_role_role_id_role_id_fk" FOREIGN KEY ("role_id") REFERENCES "public"."role"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "user_to_role" ADD CONSTRAINT "user_to_role_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "device_user_idx" ON "device" USING btree (user_id);--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "device_ua_idx" ON "device" USING btree (ua);--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "refresh_token_user_idx" ON "refresh_token" USING btree (user_id);--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "refresh_token_token_idx" ON "refresh_token" USING btree (token);--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "setting_key_idx" ON "setting" USING btree (key);--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "translation_lang_idx" ON "translation" USING btree (lang);--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "translation_ns_idx" ON "translation" USING btree (ns);--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "translation_key_idx" ON "translation" USING btree (key);