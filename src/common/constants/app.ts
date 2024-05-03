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

export const RES_KEY = {
	// error
	UNKNOWN: {
		message: "ERROR.UNKNOWN",
		code: "UKN",
	},
	VALIDATION: {
		message: "ERROR.VALIDATION",
		code: "VAL",
	},
	INTERNAL_SERVER_ERROR: {
		message: "ERROR.INTERNAL_SERVER_ERROR",
		code: "ISE",
	},
	UN_AUTHORIZATION: {
		message: "ERROR.UN_AUTHORIZATION",
		code: "U_AUTHOR",
	},
	EMAIL_ALREADY_EXIST: {
		message: "ERROR.EMAIL_ALREADY_EXIST",
		code: "CFL_01",
	},
	USERNAME_ALREADY_EXIST: {
		message: "ERROR.USERNAME_ALREADY_EXIST",
		code: "CFL_02",
	},
	NOT_FOUND: {
		message: "ERROR.NOT_FOUND",
		code: "NFD_01",
	},
	USER_NOT_FOUND: {
		message: "ERROR.USER_NOT_FOUND",
		code: "NFD_02",
	},
	USER_PASSWORD_ATTEMPT_MAX: {
		message: "ERROR.USER_PASSWORD_ATTEMPT_MAX",
		code: "FBD_01",
	},
	USER_INACTIVE: {
		message: "ERROR.USER_INACTIVE",
		code: "FBD_02",
	},
	USER_INACTIVE_PERMANENT: {
		message: "ERROR.USER_INACTIVE_PERMANENT",
		code: "FBD_03",
	},
	USER_PASSWORD_EXPIRED: {
		message: "ERROR.USER_PASSWORD_EXPIRED",
		code: "FBD_04",
	},
	USER_BLOCKED: {
		message: "ERROR.USER_BLOCKED",
		code: "FBD_05",
	},
	USER_PASSWORD_NOT_MATCH: {
		message: "ERROR.USER_PASSWORD_NOT_MATCH",
		code: "BRQ_01",
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
};

export enum ROUTES {
	AUTH_V1 = "api/v1/auth",
}

export enum AUTH_ROUTES {
	LOGIN = "/login",
	REGISTER = "/register",
}

export enum NODE_ENV {
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
	NODE_ENV: NODE_ENV.DEVELOPMENT,
	JWT_ACCESS_TOKEN_SECRET_KEY: "123456aA@",
	JWT_ACCESS_TOKEN_EXPIRED: "1H", // 1 hour
	NOT_BEFORE_EXPIRATION_TIME: "0", // immediately
	JWT_REFRESH_TOKEN_SECRET_KEY: "123456aA@",
	JWT_REFRESH_TOKEN_EXPIRED: "14d", // 14 days
	JWT_REFRESH_TOKEN_NOT_BEFORE_EXPIRATION: "1h", // 1 hour
	JWT_SUBJECT: "admin",
	JWT_AUDIENCE: "https://example.com",
	JWT_ISSUER: "admin",
	JWT_ENCRYPT_METHOD: "aes-256-cbc",
	PASSWORD_EXPIRED: "180d", // 182 days
	PASSWORD_MAX_ATTEMPT: 5,
	SALT_LENGTH: 8,
	APP_LOGO: "https://s.cloudey.net/logo/v5/cloud-blue.png",
	EXPORT_TRANSLATION_QUERY_LIMIT: 100,
	LANGUAGE: LANGUAGE.EN,
	TRANSLATION_NS: TRANSLATION_NS.BACKEND,
};
