export const TIME_REGEX = /\b(\d+)\s*(ms|s|m|h|d)\b/;
export const POSTGRES_URI_REGEX = /^postgresql:(?:\/\/[^\/]+\/)?(\w+)/;
export const PASSWORD_REGEX =
	/^(?=.*[A-Za-z])(?=.*\d)(?=.*[@$!%*#?&])[A-Za-z\d@$!%*#?&]{8,}$/;
export const URL_REGEX = /^https?:\/\/\w+(\.\w+)*(:[0-9]+)?(\/.*)?$/;
