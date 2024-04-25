import {
	DATABASE_URI_REGEX,
	PASSWORD_REGEX,
	REDIS_URI_REGEX,
	TIME_REGEX,
} from "src/common";
import { z } from "zod";
/**
 * Toggle environment variables
 * 'true' or '1' will evaluate to true
 * 'false' or '0' will evaluate to false
 */
const toggle = z
	.enum(["true", "false", "0", "1"])
	.transform((v) => v === "true" || v === "1");

const envVariables = z.object({
	DATABASE_URL: z.string().min(1).regex(DATABASE_URI_REGEX),
	NODE_ENV: z
		.enum(["development", "production", "test"])
		.default("development"),
	PORT: z.coerce.number().default(3001),
	RUNTIME: z.enum(["bun", "edge"]).default("bun"),

	// password config
	SALT_LENGTH: z.preprocess(Number, z.number().min(8)).default(8),
	PASSWORD_EXPIRED: z.string().regex(TIME_REGEX).default("180d"),
	PASSWORD_ATTEMPT: z.number().int().min(1).default(3),

	// redis config
	REDIS_URL: z.string().min(1).regex(REDIS_URI_REGEX),
	REDIS_PASSWORD: z.string().default(""),

	// admin config
	ADMIN_EMAIL: z.string().email(),
	ADMIN_USERNAME: z.string(),
	ADMIN_PASSWORD: z.string().regex(PASSWORD_REGEX),
});

export const env = envVariables.parse(process.env);
