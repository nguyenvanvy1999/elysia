export const NANO_ID_ALPHABET: string =
	"0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ";
export const NANO_ID_LENGTH: number = 24;

export enum DB_TABLE_NAME {
	USER = "user",
	ROLE = "roles",
	PERMISSION = "permission",
	USER_TO_ROLE = "user_to_role",
	PERMISSION_TO_ROLE = "permission_to_role",
	REFRESH_TOKEN = "refresh_token",
}

export enum DB_ID_PREFIX {
	USER = "user",
}
