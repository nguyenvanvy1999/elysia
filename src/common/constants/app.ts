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
		setting: { name: "Setting", description: "Setting endpoints" },
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

	// un authorization error
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

	// conflict error
	EMAIL_ALREADY_EXIST: {
		message: "ERROR.EMAIL_ALREADY_EXIST",
		code: "CONFLICT_1",
	},
	USERNAME_ALREADY_EXIST: {
		message: "ERROR.USERNAME_ALREADY_EXIST",
		code: "CONFLICT_2",
	},
	SETTING_ALREADY_EXIST: {
		message: "ERROR.SETTING_ALREADY_EXIST",
		code: "CONFLICT_3",
	},

	// not found error
	NOT_FOUND: {
		message: "ERROR.NOT_FOUND",
		code: "NOT_FOUND_1",
	},
	USER_NOT_FOUND: {
		message: "ERROR.USER_NOT_FOUND",
		code: "NOT_FOUND_2",
	},
	SETTING_NOT_FOUND: {
		message: "ERROR.SETTING_NOT_FOUND",
		code: "NOT_FOUND_3",
	},

	// forbidden resource error
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
	ABILITY_FORBIDDEN: {
		message: "ERROR.ABILITY_FORBIDDEN",
		code: "FORBIDDEN_RESOURCE_6",
	},

	// bad request error
	USER_PASSWORD_NOT_MATCH: {
		message: "ERROR.USER_PASSWORD_NOT_MATCH",
		code: "BAD_REQUEST_1",
	},
	ACTIVE_ACCOUNT_EMAIL_RATE_LIMIT: {
		message: "ERROR.ACTIVE_ACCOUNT_EMAIL_RATE_LIMIT",
		code: "BAD_REQUEST_2",
	},
	SETTING_VALUE_NOT_ALLOWED_ERROR: {
		message: "ERROR.SETTING_VALUE_NOT_ALLOWED_ERROR",
		code: "BAD_REQUEST_3",
	},

	// service unavailable error
	MAINTENANCE: {
		message: "ERROR.MAINTENANCE",
		code: "SERVICE_UNAVAILABLE_1",
	},
	DISABLE_REGISTER: {
		message: "ERROR.DISABLE_REGISTER",
		code: "SERVICE_UNAVAILABLE_2",
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
	CREATE_SETTING: {
		message: "RES.CREATE_SETTING_SUCCESS",
		code: "SUC_04",
	},
	GET_SETTING: {
		message: "RES.GET_SETTING_SUCCESS",
		code: "SUC_05",
	},
	LIST_SETTING: {
		message: "RES.LIST_SETTING_SUCCESS",
		code: "SUC_05",
	},
};

export const SW_ROUTE_DETAIL = {
	// auth APIs
	LOGIN: {
		description: "Login with email and password",
		summary: "Login",
	},
	REGISTER: {
		description: "Register new user with role user",
		summary: "Register",
	},

	// user APIs
	USER_INFO: {
		description: "Get user information",
		summary: "User info",
	},
	SEND_EMAIL_VERIFY: {
		description: "Send email verify account",
		summary: "Send email verify",
	},

	// setting APIs
	CREATE_SETTING: {
		description: "Create setting",
		summary: "Create setting",
	},
	GET_SETTING: {
		description: "Get setting detail",
		summary: "Get setting",
	},
	LIST_SETTING: {
		description: "Get list settings",
		summary: "Get list settings",
	},
};

export enum ROUTES {
	AUTH_V1 = "/v1/auth",
	USER_V1 = "/v1/user",
	SETTING_V1 = "/v1/setting",
}

export enum AUTH_ROUTES {
	LOGIN = "/login",
	REGISTER = "/register",
}

export enum USER_ROUTES {
	INFO = "/info",
	SEND_EMAIL_VERIFY = "/send-email-active-account",
}

export enum SETTING_ROUTES {
	CREATE = "/",
	GET = "/:id",
	LIST = "/list",
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
	APP_ENV: APP_ENV.DEVELOPMENT,
	JWT_ACCESS_TOKEN_SECRET_KEY: "123456aA@",
	API_PREFIX: "/api",
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
	ACTIVE_ACCOUNT_TOKEN_EXPIRED: "5m",
	LOG_LEVEL: "trace",
	PAGING_LIMIT: 10,
	PAGING_OFFSET: 0,
};

export enum HTTP_METHOD {
	GET = "GET",
	POST = "POST",
	PUT = "PUT",
	PATCH = "PATCH",
	DELETE = "DELETE",
	OPTIONS = "OPTIONS",
	HEAD = "HEAD",
}

export enum APP_SERVICE {
	REDIS = "redis",
	KAFKA = "kafka",
	POSTGRES = "postgres",
}
