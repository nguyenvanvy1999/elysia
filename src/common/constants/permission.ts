export enum POLICY_ACTION {
	MANAGE = "manage",
	READ = "read",
	CREATE = "create",
	UPDATE = "update",
	DELETE = "delete",
	EXPORT = "export",
	IMPORT = "import",
}

export enum POLICY_ENTITY {
	API_KEY = "api_key",
	SETTING = "setting",
	ROLE = "role",
	USER = "user",
	CLIENT_LANGUAGE = "client_language",
	TRANSLATION = "translation",
	DEVICE = "device",
	PERMISSION = "permission",
}

export enum POLICY_ACCESS {
	OWNER = "owner",
	ANY = "any",
}

export enum ROLE_NAME {
	ADMIN = "admin",
	USER = "user",
}
