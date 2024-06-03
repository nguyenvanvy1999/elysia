import camelcaseKeys from "camelcase-keys";
import dotenv from "dotenv";
import {
	DEFAULT,
	HTTP_METHOD,
	PASSWORD_REGEX,
	POSTGRES_URI_REGEX,
	TIME_REGEX,
	URL_REGEX,
} from "src/common";
import { z } from "zod";
import packageJson from "../../package.json";

dotenv.config({ path: `.env.${process.env.APP_ENV}` });

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
		APP_ENDPOINT: z.string().regex(URL_REGEX),

		// database config
		POSTGRES_URI: z.string().min(1).regex(POSTGRES_URI_REGEX),
		DATABASE_DEBUG: toggle.default("false"),

		// password config
		PASSWORD_SALT_LENGTH: z
			.preprocess(Number, z.number().min(4))
			.default(DEFAULT.SALT_LENGTH),
		PASSWORD_PEPPER: z.string().min(8),
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

		// bull board
		ENB_BULL_BOARD: toggle.default("true"),
		BULL_BOARD_PATH: z.string().default(DEFAULT.BULL_BOARD_PATH),

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

		// active token config
		ACTIVE_ACCOUNT_TOKEN_ENCRYPT_KEY: z.string(),
		ACTIVE_ACCOUNT_TOKEN_ENCRYPT_IV: z.string(),
		ACTIVE_ACCOUNT_TOKEN_EXPIRED: z
			.string()
			.regex(TIME_REGEX)
			.default(DEFAULT.ACTIVE_ACCOUNT_TOKEN_EXPIRED),

		// redis config
		REDIS_HOST: z.string(),
		REDIS_PASSWORD: z.string().default(""),
		REDIS_PORT: z.coerce.number(),

		// admin config
		ADMIN_EMAIL: z.string().email(),
		ADMIN_USERNAME: z.string(),
		ADMIN_PASSWORD: z.string().regex(PASSWORD_REGEX),

		// logger config
		LOG_LEVEL: z.string().default(DEFAULT.LOG_LEVEL),

		// setting config
		SETTING_ENCRYPT_KEY: z.string(),
		SETTING_ENCRYPT_IV: z.string(),

		// version config
		APP_VERSION: z.string().default(packageJson.version),

		// sendgrid config
		SENDGRID_API_KEY: z.string(),
		SENDGRID_MAIL_FROM: z.string().email(),

		// twilio config
		TWILIO_ACCOUNT_SID: z.string(),
		TWILIO_AUTH_TOKEN: z.string(),
		TWILIO_VERIFY_SID: z.string(),
		TWILIO_FROM: z.string(),

		// device token config
		DEVICE_TOKEN_ENCRYPT_KEY: z.string(),
		DEVICE_TOKEN_ENCRYPT_IV: z.string(),
		DEVICE_TOKEN_EXPIRED: z
			.string()
			.regex(TIME_REGEX)
			.default(DEFAULT.DEVICE_TOKEN_EXPIRED),

		// magic login token
		MAGIC_LOGIN_TOKEN_ENCRYPT_KEY: z.string(),
		MAGIC_LOGIN_TOKEN_ENCRYPT_IV: z.string(),
		MAGIC_LOGIN_TOKEN_EXPIRED: z
			.string()
			.regex(TIME_REGEX)
			.default(DEFAULT.MAGIC_LOGIN_TOKEN_EXPIRED),
	})
	.transform((input) => ({
		...camelize(input),
		cors: {
			allowMethod: [
				HTTP_METHOD.GET,
				HTTP_METHOD.DELETE,
				HTTP_METHOD.PUT,
				HTTP_METHOD.PATCH,
				HTTP_METHOD.POST,
			],
			allowOrigin: "*", // allow all origin
			// allowOrigin: [/example\.com(\:\d{1,4})?$/], // allow all subdomain, and all port
			// allowOrigin: [/example\.com$/], // allow all subdomain without port
			allowHeader: [
				"Accept",
				"Accept-Language",
				"Content-Language",
				"Content-Type",
				"Origin",
				"Authorization",
				"Access-Control-Request-Method",
				"Access-Control-Request-Headers",
				"Access-Control-Allow-Headers",
				"Access-Control-Allow-Origin",
				"Access-Control-Allow-Methods",
				"Access-Control-Allow-Credentials",
				"Access-Control-Expose-Headers",
				"Access-Control-Max-Age",
				"Referer",
				"Host",
				"X-Requested-With",
				"x-custom-lang",
				"x-timestamp",
				"x-api-key",
				"x-timezone",
				"x-request-id",
				"x-version",
				"x-repo-version",
				"X-Response-Time",
				"user-agent",
				"User-Agent",
			],
		},
		repoVersion: packageJson.version,
	}));

export const config = envVariables.parse(process.env);
