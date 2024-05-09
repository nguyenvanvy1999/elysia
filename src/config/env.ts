import camelcaseKeys from "camelcase-keys";
import {
	DEFAULT,
	PASSWORD_REGEX,
	POSTGRES_URI_REGEX,
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

const camelize = <T extends Record<string, unknown>>(val: T) =>
	camelcaseKeys(val);

const envVariables = z
	.object({
		// app config
		APP_ENV: z
			.enum(["development", "production", "test"])
			.default(DEFAULT.APP_ENV),
		APP_PORT: z.coerce.number().default(DEFAULT.PORT),
		RUNTIME: z.enum(["bun", "edge"]).default("bun"),
		ENABLE_SSL: toggle.default("false"),

		// API config
		API_PREFIX: z.string().default(DEFAULT.API_PREFIX),
		ENB_API_VERSION: toggle.default("true"),

		// database config
		POSTGRES_URI: z.string().min(1).regex(POSTGRES_URI_REGEX),
		DATABASE_DEBUG: toggle.default("false"),

		// password config
		PASSWORD_SALT_LENGTH: z
			.preprocess(Number, z.number().min(4))
			.default(DEFAULT.SALT_LENGTH),
		PASSWORD_PEPPER: z.string().min(8),
		ENB_PASSWORD_ATTEMPT: toggle.default("true"),
		ENB_PASSWORD_EXPIRED: toggle.default("true"),
		PASSWORD_EXPIRED: z
			.string()
			.regex(TIME_REGEX)
			.default(DEFAULT.PASSWORD_EXPIRED),
		PASSWORD_ATTEMPT: z
			.number()
			.int()
			.min(1)
			.default(DEFAULT.PASSWORD_MAX_ATTEMPT),

		// swagger config
		ENB_SWAGGER_UI: toggle.default("true"),
		SWAGGER_UI_PATH: z.string().default(DEFAULT.SWAGGER_UI_PATH),

		// jwt config
		ENB_TOKEN_ENCRYPT: toggle.default("true"),
		JWT_AUDIENCE: z.string().default(DEFAULT.JWT_AUDIENCE),
		JWT_ISSUER: z.string().default(DEFAULT.JWT_ISSUER),
		JWT_SUBJECT: z.string().default(DEFAULT.JWT_SUBJECT),
		JWT_ENCRYPT_METHOD: z.string().default(DEFAULT.JWT_ENCRYPT_METHOD),

		// access token config
		JWT_ACCESS_TOKEN_SECRET_KEY: z
			.string()
			.default(DEFAULT.JWT_ACCESS_TOKEN_SECRET_KEY),
		JWT_PAYLOAD_ACCESS_TOKEN_ENCRYPT_KEY: z.string(),
		JWT_PAYLOAD_ACCESS_TOKEN_ENCRYPT_IV: z.string(),
		JWT_ACCESS_TOKEN_EXPIRED: z
			.string()
			.regex(TIME_REGEX)
			.default(DEFAULT.JWT_ACCESS_TOKEN_EXPIRED),
		JWT_ACCESS_TOKEN_NOT_BEFORE_EXPIRATION: z
			.string()
			.default(DEFAULT.NOT_BEFORE_EXPIRATION_TIME),

		// refresh token config
		JWT_REFRESH_TOKEN_SECRET_KEY: z
			.string()
			.default(DEFAULT.JWT_REFRESH_TOKEN_SECRET_KEY),
		JWT_PAYLOAD_REFRESH_TOKEN_ENCRYPT_KEY: z.string(),
		JWT_PAYLOAD_REFRESH_TOKEN_ENCRYPT_IV: z.string(),
		JWT_REFRESH_TOKEN_EXPIRED: z
			.string()
			.regex(TIME_REGEX)
			.default(DEFAULT.JWT_REFRESH_TOKEN_EXPIRED),
		JWT_REFRESH_TOKEN_NOT_BEFORE_EXPIRATION: z
			.string()
			.default(DEFAULT.NOT_BEFORE_EXPIRATION_TIME),

		// redis config
		REDIS_URL: z.string().min(1).regex(REDIS_URI_REGEX),
		REDIS_PASSWORD: z.string().default(""),

		// admin config
		ADMIN_EMAIL: z.string().email(),
		ADMIN_USERNAME: z.string(),
		ADMIN_PASSWORD: z.string().regex(PASSWORD_REGEX),
	})
	.transform(camelize);

export const env = envVariables.parse(process.env);
