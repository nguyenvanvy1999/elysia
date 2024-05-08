import crypto from "node:crypto";
import ms from "ms";
import type { IAuthPassword } from "src/common";
import { env } from "src/config";
import { forwardInSeconds } from "src/util/date";

export const createPassword = (password: string): IAuthPassword => {
	const passwordSalt: string = crypto
		.randomBytes(env.passwordSaltLength)
		.toString("hex");
	const passwordHash: string = Bun.password.hashSync(
		passwordSalt + password + env.passwordPepper,
	);
	const passwordExpired: Date = forwardInSeconds(ms(env.passwordExpired));
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
	return Bun.password.verifySync(salt + password + env.passwordPepper, hash);
};
