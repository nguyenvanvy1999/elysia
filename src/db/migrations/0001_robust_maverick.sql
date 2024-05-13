DROP INDEX IF EXISTS "user_idx";--> statement-breakpoint
DROP INDEX IF EXISTS "token_idx";--> statement-breakpoint
DROP INDEX IF EXISTS "lang_idx";--> statement-breakpoint
DROP INDEX IF EXISTS "ns_idx";--> statement-breakpoint
DROP INDEX IF EXISTS "key_idx";--> statement-breakpoint
ALTER TABLE "setting" ADD COLUMN "is_encrypted" boolean DEFAULT false;--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "refresh_token_user_idx" ON "refresh_token" ("user_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "refresh_token_token_idx" ON "refresh_token" ("token");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "translation_lang_idx" ON "translation" ("lang");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "translation_ns_idx" ON "translation" ("ns");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "translation_key_idx" ON "translation" ("key");