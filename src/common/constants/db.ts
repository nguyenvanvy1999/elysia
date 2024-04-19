export const NANO_ID_ALPHABET: string =
	"0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ";
export const NANO_ID_LENGTH: number = 24;

export enum DB_TABLE_NAME {
	USER = "user",
	ACCOUNT = "account",
	ROLE = "roles",
	PERMISSION = "permission",
	USER_TO_ROLE = "user_to_role",
	PERMISSION_TO_ROLE = "permission_to_role",
	VERIFICATION_TOKEN = "verification_token",
}
