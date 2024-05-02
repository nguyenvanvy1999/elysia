export const versionOptions = {
	repoVersion: "1.0.50",
	version: "1.0.50",
};

export const swaggerOptions = {
	enable: true,
	authEnable: true,
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

export const DEFAULT_APP_LANGUAGE: string = LANGUAGE.EN;
export const DEFAULT_LANGUAGE_NS: string = "translation";

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
	UNKNOWN: {
		message: "ERROR.UNKNOWN",
		code: "UKN",
	},
	VALIDATION: {
		message: "ERROR.VALIDATION",
		code: "VAL",
	},
	NOT_FOUND: {
		message: "ERROR.NOT_FOUND",
		code: "NFD",
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
		code: "CFL01",
	},
	USERNAME_ALREADY_EXIST: {
		message: "ERROR.USERNAME_ALREADY_EXIST",
		code: "CFL02",
	},
};
