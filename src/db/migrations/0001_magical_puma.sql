DO $$ BEGIN
 CREATE TYPE "user_status_enum" AS ENUM('active', 'inactive', 'inactive_permanent', 'block');
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
ALTER TABLE "user" ADD COLUMN "status" "user_status_enum" DEFAULT 'active' NOT NULL;