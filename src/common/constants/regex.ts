export const TIME_REGEX = /\b(\d+)\s*(ms|s|m|h|d)\b/;
export const REDIS_URI_REGEX =
	/^redis:\/\/(?:([^:@]+):([^:@]+)@)?([^/:]+)(?::(\d+))?(?:\/(\d+))?$/;
export const DATABASE_URI_REGEX = /^postgresql:(?:\/\/[^\/]+\/)?(\w+)/;
export const PASSWORD_REGEX =
	/^(?=.*?[A-Z])(?=.*?[a-z])(?=.*?[0-9])(?=.*?[#?!@$%^&*-]).{8,}$/;
