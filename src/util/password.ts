import { genSaltSync, hashSync } from "bcryptjs";
import ms from "ms";
import type { IAuthPassword } from "src/common";
import { env } from "src/config";
import { forwardInSeconds } from "src/util/date";

export const createPassword = (password: string): IAuthPassword => {
	const salt: string = genSaltSync(env.SALT_LENGTH);

	const passwordExpired: Date = forwardInSeconds(ms(env.PASSWORD_EXPIRED));
	const passwordHash: string = hashSync(password, salt);
	return {
		password: passwordHash,
		passwordExpired,
		passwordCreated: new Date(),
		salt,
		passwordAttempt: env.PASSWORD_ATTEMPT,
	};
};
