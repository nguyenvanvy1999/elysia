export const TIME_REGEX = /\b(\d+)\s*(ms|s|m|h|d)\b/;
export const REDIS_URI_REGEX =
	/^redis:\/\/(?:([^:@]+):([^:@]+)@)?([^/:]+)(?::(\d+))?(?:\/(\d+))?$/;
export const POSTGRES_URI_REGEX = /^postgresql:(?:\/\/[^\/]+\/)?(\w+)/;
export const PASSWORD_REGEX =
	/^(?=.*[A-Za-z])(?=.*\d)(?=.*[@$!%*#?&])[A-Za-z\d@$!%*#?&]{8,}$/;
