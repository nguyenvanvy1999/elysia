export const versionOptions = {
	repoVersion: "1.0.50",
	version: "1.0.50",
};

export const swaggerOptions = {
	path: "/swagger",
	info: {
		title: "Elysia Documentation",
		description: "Development documentation",
		contact: {
			name: "Nguyen Van Vy",
			url: "https://www.facebook.com/vy.nguyenvan.79656",
			email: "nguyenvanvy1999@gmail.com",
		},
		license: { name: "MIT", url: "https://opensource.org/license/mit" },
		termsOfService: "termsOfService",
	},
	tags: {
		auth: { name: "Auth", description: "Authentication endpoints" },
		app: { name: "App", description: "General endpoints" },
		user: { name: "User", description: "User endpoints" },
	},
};

export enum LANGUAGE {
	EN = "en",
	VI = "vi",
}

export const AVAILABLE_LANGUAGES: string[] = Object.values(LANGUAGE);

export enum HEADER_KEY {
	DEVICE_ID = "device-id",
	AUTHORIZATION = "authorization",
	X_TIMEZONE = "x-timezone",
	X_CUSTOM_LANGUAGE = "x-custom-lang",
	X_TIMESTAMP = "x-timestamp",
	X_REQUEST_ID = "x-request-id",
	X_VERSION = "x-version",
	X_REPO_VERSION = "x-repo-version",
	USER_AGENT = "User-Agent",
	IP = "request-ip",
}

// cache time in redis on seconds
export const REDIS_CACHE_EX = {
	TRANSLATION_CACHE: 60 * 10, // 10 minutes
};

export enum REDIS_KEY {
	SETTING_MAINTENANCE = "setting_maintenance",
}

export const RES_KEY = {
	// error
	UNKNOWN: {
		message: "ERROR.UNKNOWN",
		code: "UNKNOWN_1",
	},
	VALIDATION: {
		message: "ERROR.VALIDATION",
		code: "VALIDATION",
	},
	INTERNAL_SERVER_ERROR: {
		message: "ERROR.INTERNAL_SERVER_ERROR",
		code: "INTERNAL_SERVER_ERROR",
	},
	UN_AUTHORIZATION: {
		message: "ERROR.UN_AUTHORIZATION",
		code: "UN_AUTHORIZATION_1",
	},
	WRONG_TOKEN: {
		message: "ERROR.WRONG_TOKEN",
		code: "UN_AUTHORIZATION_2",
	},
	TOKEN_EMPTY: {
		message: "ERROR.TOKEN_EMPTY",
		code: "UN_AUTHORIZATION_3",
	},
	TOKEN_EXPIRED: {
		message: "ERROR.TOKEN_EXPIRED",
		code: "UN_AUTHORIZATION_4",
	},
	EMAIL_ALREADY_EXIST: {
		message: "ERROR.EMAIL_ALREADY_EXIST",
		code: "CONFLICT_1",
	},
	USERNAME_ALREADY_EXIST: {
		message: "ERROR.USERNAME_ALREADY_EXIST",
		code: "CONFLICT_2",
	},
	NOT_FOUND: {
		message: "ERROR.NOT_FOUND",
		code: "NOT_FOUND_1",
	},
	USER_NOT_FOUND: {
		message: "ERROR.USER_NOT_FOUND",
		code: "NOT_FOUND_2",
	},
	USER_PASSWORD_ATTEMPT_MAX: {
		message: "ERROR.USER_PASSWORD_ATTEMPT_MAX",
		code: "FORBIDDEN_RESOURCE_1",
	},
	USER_INACTIVE: {
		message: "ERROR.USER_INACTIVE",
		code: "FORBIDDEN_RESOURCE_2",
	},
	USER_INACTIVE_PERMANENT: {
		message: "ERROR.USER_INACTIVE_PERMANENT",
		code: "FORBIDDEN_RESOURCE_3",
	},
	USER_PASSWORD_EXPIRED: {
		message: "ERROR.USER_PASSWORD_EXPIRED",
		code: "FORBIDDEN_RESOURCE_4",
	},
	USER_BLOCKED: {
		message: "ERROR.USER_BLOCKED",
		code: "FORBIDDEN_RESOURCE_5",
	},
	USER_PASSWORD_NOT_MATCH: {
		message: "ERROR.USER_PASSWORD_NOT_MATCH",
		code: "BAD_REQUEST_1",
	},
	MAINTENANCE: {
		message: "ERROR.MAINTENANCE",
		code: "SERVICE_UNAVAILABLE",
	},

	// response
	REGISTER: {
		message: "RES.REGISTER_SUCCESS",
		code: "SUC_01",
	},
	LOGIN: {
		message: "RES.LOGIN_SUCCESS",
		code: "SUC_02",
	},
	USER_INFO: {
		message: "RES.GET_USER_INFO_SUCCESS",
		code: "SUC_03",
	},
};

export const SW_ROUTE_DETAIL = {
	LOGIN: {
		description: "Login with email and password",
		summary: "Login",
	},
	REGISTER: {
		description: "Register new user with role user",
		summary: "Register",
	},
	USER_INFO: {
		description: "Get user information",
		summary: "User info",
	},
};

export enum ROUTES {
	AUTH_V1 = "/v1/auth",
	USER_V1 = "/v1/user",
}

export enum AUTH_ROUTES {
	LOGIN = "/login",
	REGISTER = "/register",
}

export enum USER_ROUTES {
	INFO = "/info",
}

export enum APP_ENV {
	DEVELOPMENT = "development",
	PRODUCTION = "production",
	TEST = "test",
}

export enum TRANSLATION_NS {
	BACKEND = "backend",
	FRONTEND = "frontend",
}

export const DEFAULT = {
	PORT: 3001,
	API_PREFIX: "/api",
	APP_ENV: APP_ENV.DEVELOPMENT,
	JWT_ACCESS_TOKEN_SECRET_KEY: "123456aA@",
	JWT_ACCESS_TOKEN_EXPIRED: "1H", // 1 hour
	NOT_BEFORE_EXPIRATION_TIME: "0", // immediately
	JWT_REFRESH_TOKEN_SECRET_KEY: "123456aA@",
	JWT_REFRESH_TOKEN_EXPIRED: "14d", // 14 days
	JWT_SUBJECT: "admin",
	JWT_AUDIENCE: "https://example.com",
	JWT_ISSUER: "admin",
	JWT_ENCRYPT_METHOD: "aes-256-cbc",
	PASSWORD_EXPIRED: "180d", // 180 days
	PASSWORD_MAX_ATTEMPT: 5,
	SALT_LENGTH: 8,
	APP_LOGO: "https://s.cloudey.net/logo/v5/cloud-blue.png",
	LANGUAGE: LANGUAGE.EN,
	TRANSLATION_NS: TRANSLATION_NS.BACKEND,
	SWAGGER_UI_PATH: "/swagger",
};
