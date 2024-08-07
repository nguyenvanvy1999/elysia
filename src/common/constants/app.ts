export const swaggerOptions = {
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
		device: { name: "Device", description: "Device management endpoints" },
		permission: { name: "Permission", description: "Permission endpoints" },
		role: { name: "Role", description: "Role endpoints" },
	},
};

export enum LANGUAGE {
	EN = "en",
	VI = "vi",
}

export const AVAILABLE_LANGUAGES: string[] = Object.values(LANGUAGE);

export enum HEADER_KEY {
	AUTHORIZATION = "authorization",
	X_TIMEZONE = "x-timezone",
	X_CUSTOM_LANGUAGE = "x-custom-lang",
	X_TIMESTAMP = "x-timestamp",
	X_REQUEST_ID = "x-request-id",
	X_VERSION = "x-version",
	X_REPO_VERSION = "x-repo-version",
	USER_AGENT = "User-Agent",
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
	ROLE_ALREADY_EXIST: {
		message: "ERROR.ROLE_ALREADY_EXIST",
		code: "CONFLICT_4",
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
	DEVICE_NOT_FOUND: {
		message: "ERROR.DEVICE_NOT_FOUND",
		code: "NOT_FOUND_4",
	},
	ROLE_NOT_FOUND: {
		message: "ERROR.ROLE_NOT_FOUND",
		code: "NOT_FOUND_5",
	},
	MAGIC_LOGIN_TOKEN_NOT_FOUND: {
		message: "ERROR.MAGIC_LOGIN_TOKEN_NOT_FOUND",
		code: "NOT_FOUND_6",
	},
	PERMISSION_NOT_FOUND: {
		message: "ERROR.PERMISSION_NOT_FOUND",
		code: "NOT_FOUND_7",
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
	USER_HAS_BEEN_ACTIVATED: {
		message: "ERROR.USER_HAS_BEEN_ACTIVATED",
		code: "FORBIDDEN_RESOURCE_7",
	},
	CAN_NOT_MODIFY_DEFAULT_ROLE: {
		message: "ERROR.CAN_NOT_MODIFY_DEFAULT_ROLE",
		code: "FORBIDDEN_RESOURCE_8",
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
	CAN_NOT_DELETE_THIS_SETTING: {
		message: "ERROR.CAN_NOT_DELETE_THIS_SETTING",
		code: "BAD_REQUEST_4",
	},
	CAN_NOT_CHANGE_TYPE_OF_THIS_SETTING: {
		message: "ERROR.CAN_NOT_CHANGE_TYPE_OF_THIS_SETTING",
		code: "BAD_REQUEST_5",
	},
	ACTIVE_ACCOUNT_TOKEN_WRONG: {
		message: "ERROR.ACTIVE_ACCOUNT_TOKEN_WRONG",
		code: "BAD_REQUEST_6",
	},
	DEVICE_TOKEN_WRONG: {
		message: "ERROR.DEVICE_TOKEN_WRONG",
		code: "BAD_REQUEST_7",
	},
	PERMISSION_IDS_WRONG: {
		message: "ERROR.PERMISSION_IDS_WRONG",
		code: "BAD_REQUEST_8",
	},
	MAGIC_LOGIN_EMAIL_RATE_LIMIT: {
		message: "ERROR.MAGIC_LOGIN_EMAIL_RATE_LIMIT",
		code: "BAD_REQUEST_9",
	},
	MAGIC_LOGIN_TOKEN_WRONG: {
		message: "ERROR.MAGIC_LOGIN_TOKEN_WRONG",
		code: "BAD_REQUEST_10",
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
		code: "SUC_06",
	},
	DELETE_SETTING: {
		message: "RES.DELETE_SETTING_SUCCESS",
		code: "SUC_07",
	},
	UPDATE_SETTING: {
		message: "RES.UPDATE_SETTING_SUCCESS",
		code: "SUC_08",
	},
	LOGOUT: {
		message: "RES.LOGOUT_SUCCESS",
		code: "SUC_09",
	},
	LOGOUT_ALL: {
		message: "RES.LOGOUT_ALL_SUCCESS",
		code: "SUC_10",
	},
	SEND_EMAIL_VERIFY_ACCOUNT: {
		message: "RES.SEND_EMAIL_VERIFY_ACCOUNT_SUCCESS",
		code: "SUC_11",
	},
	VERIFY_ACCOUNT: {
		message: "RES.VERIFY_ACCOUNT_SUCCESS",
		code: "SUC_12",
	},
	LOGIN_NEW_DEVICE: {
		message: "RES.LOGIN_NEW_DEVICE_SUCCESS",
		code: "SUC_13",
	},
	CONFIRM_DEVICE: {
		message: "RES.CONFIRM_DEVICE_SUCCESS",
		code: "SUC_14",
	},
	LIST_DEVICES: {
		message: "RES.LIST_DEVICES_SUCCESS",
		code: "SUC_15",
	},
	LOGOUT_DEVICE: {
		message: "RES.LOGOUT_DEVICE_SUCCESS",
		code: "SUC_16",
	},
	LIST_PERMISSION: {
		message: "RES.LIST_PERMISSION_SUCCESS",
		code: "SUC_17",
	},
	LIST_ROLE: {
		message: "RES.LIST_ROLE_SUCCESS",
		code: "SUC_18",
	},
	GET_ROLE: {
		message: "RES.GET_ROLE_SUCCESS",
		code: "SUC_19",
	},
	CREATE_ROLE: {
		message: "RES.CREATE_ROLE_SUCCESS",
		code: "SUC_19",
	},
	UPDATE_ROLE: {
		message: "RES.UPDATE_ROLE_SUCCESS",
		code: "SUC_20",
	},
	DELETE_ROLE: {
		message: "RES.DELETE_ROLE_SUCCESS",
		code: "SUC_21",
	},
	SEND_MAGIC_LINK: {
		message: "RES.SEND_MAGIC_LINK",
		code: "SUC_22",
	},
	MAGIC_LOGIN: {
		message: "RES.MAGIC_LOGIN_SUCCESS",
		code: "SUC_23",
	},
	GET_USER_BY_ID: {
		message: "RES.GET_USER_BY_ID_SUCCESS",
		code: "SUC_24",
	},
	UPDATE_PERMISSION: {
		message: "RES.UPDATE_PERMISSION_SUCCESS",
		code: "SUC_25",
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
	LOGOUT: {
		description: "Logout from this device",
		summary: "Logout",
	},
	LOGOUT_ALL: {
		description: "Logout from all devices",
		summary: "Logout all",
	},
	CONFIRM_DEVICE: {
		description: "Confirm new device",
		summary: "Confirm device",
	},
	LOGOUT_DEVICE: {
		description: "Logout from a device",
		summary: "Logout device",
	},
	SEND_EMAIL_MAGIC_LOGIN: {
		description: "Send email magic login",
		summary: "Send email magic login",
	},
	MAGIC_LOGIN: {
		description: "Magic login",
		summary: "Magic login",
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
	VERIFY_ACCOUNT: {
		description: "Verify account",
		summary: "Verify account",
	},
	USER_BY_ID: {
		description: "Get user information by id",
		summary: "Get user",
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
	DELETE_SETTING: {
		description: "Delete setting with id",
		summary: "Delete setting",
	},
	UPDATE_SETTING: {
		description: "Update setting with id",
		summary: "Update setting",
	},

	// device APIs
	LIST_DEVICES: {
		description: "Get list devices",
		summary: "List devices",
	},

	// permission APIs
	LIST_PERMISSION: {
		description: "Get list permissions",
		summary: "List permissions",
	},
	UPDATE_PERMISSION: {
		description: "Update permission with id",
		summary: "Update permission",
	},

	// role APIs
	LIST_ROLE: {
		description: "Get list roles",
		summary: "List roles",
	},
	GET_ROLE: {
		description: "Get role detail",
		summary: "Get role",
	},
	CREATE_ROLE: {
		description: "Create role",
		summary: "Create role",
	},
	UPDATE_ROLE: {
		description: "Update role with id",
		summary: "Update role",
	},
	DELETE_ROLE: {
		description: "Delete role with id",
		summary: "Delete role",
	},
};

export enum ROUTES {
	AUTH_V1 = "/api/v1/auth",
	USER_V1 = "/api/v1/user",
	SETTING_V1 = "/api/v1/setting",
	DEVICE_V1 = "/api/v1/device",
	PERMISSION_V1 = "/api/v1/permission",
	ROLE_V1 = "/api/v1/role",
}

export enum AUTH_ROUTES {
	LOGIN = "/login",
	REGISTER = "/register",
	LOGOUT = "/logout",
	LOGOUT_ALL = "/logout-all",
	LOGOUT_DEVICE = "/logout-device",
	CONFIRM_DEVICE = "/confirm-device",
	SEND_MAGIC_LOGIN_LINK = "/email-magic-login",
	MAGIC_LOGIN = "/magic-login",
}

export enum USER_ROUTES {
	INFO = "/info",
	SEND_EMAIL_VERIFY = "/send-email-active-account",
	ACTIVE_ACCOUNT = "/active-account",
	USER_BY_ID = "/:id",
}

export enum SETTING_ROUTES {
	CREATE = "/",
	GET = "/:id",
	LIST = "/list",
	DELETE = "/:id",
	UPDATE = "/:id",
}

export enum DEVICE_ROUTES {
	LIST = "/list",
}

export enum PERMISSIONS_ROUTES {
	LIST = "/list",
	UPDATE = "/:id",
}

export enum ROLE_ROUTES {
	CREATE = "/",
	GET = "/:id",
	LIST = "/list",
	DELETE = "/:id",
	UPDATE = "/:id",
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
	BULL_BOARD_PATH: "/queues",
	ACTIVE_ACCOUNT_TOKEN_EXPIRED: "5m",
	DEVICE_TOKEN_EXPIRED: "5m",
	MAGIC_LOGIN_TOKEN_EXPIRED: "5m",
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
	POSTGRES = "postgres",
	QUEUE = "queue",
}

export const PAGING_MAX_LIMIT: number = 200;

export enum BULL_QUEUE {
	SEND_MAIL = "send_mail",
}

export const BULL_QUEUE_JOB_REMOVAL = {
	SEND_MAIL: {
		MAX_COMPLETED: 1000,
		MAX_FAILED: 5000,
	},
};

export const BULL_JOB_ID_LENGTH = 6;

export enum EMAIL_TYPE {
	VERIFY_ACCOUNT = "verify-account",
	WELCOME = "welcome",
	LOGIN_NEW_DEVICE = "login-new-device",
	WARNING_PASSWORD_ATTEMPT = "warning-password-attempt",
	VERIFY_LOGIN_NEW_DEVICE = "verify-login-new-device",
	MAGIC_LOGIN = "magic-login",
}

export enum LOGIN_METHOD {
	PASSWORD = "password",
	MAGIC_LOGIN = "magic_login",
}
