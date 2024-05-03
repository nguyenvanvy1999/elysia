import ms from "ms";
import type { IAuthPassword } from "src/common";
import { env } from "src/config";
import { forwardInSeconds } from "src/util/date";

export const createPassword = (password: string): IAuthPassword => {
	const passwordHash: string = Bun.password.hashSync(password, {
		algorithm: "bcrypt",
		cost: env.SALT_LENGTH,
	});
	const passwordExpired: Date = forwardInSeconds(ms(env.PASSWORD_EXPIRED));
	return {
		password: passwordHash,
		passwordExpired,
		passwordCreated: new Date(),
		passwordAttempt: 0,
	} satisfies IAuthPassword;
};

export const checkPasswordExpired = (passwordExpired: Date): boolean => {
	return new Date() > new Date(passwordExpired);
};
