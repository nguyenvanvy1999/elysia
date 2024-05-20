import crypto from "node:crypto";
import ms from "ms";
import type { IAuthPassword } from "src/common";
import { config } from "src/config";
import { forwardInMilliSeconds } from "src/util/date";

export const createPassword = (password: string): IAuthPassword => {
	const passwordSalt: string = crypto
		.randomBytes(config.passwordSaltLength)
		.toString("hex");
	const passwordHash: string = Bun.password.hashSync(
		passwordSalt + password + config.passwordPepper,
	);
	const passwordExpired: Date = forwardInMilliSeconds(
		ms(config.passwordExpired),
	);
	return {
		password: passwordHash,
		passwordExpired,
		passwordCreated: new Date(),
		passwordAttempt: 0,
		passwordSalt,
	} satisfies IAuthPassword;
};

export const checkPasswordExpired = (passwordExpired: Date): boolean => {
	return new Date() > new Date(passwordExpired);
};

export const comparePassword = (
	password: string,
	hash: string,
	salt: string,
): boolean => {
	return Bun.password.verifySync(salt + password + config.passwordPepper, hash);
};
