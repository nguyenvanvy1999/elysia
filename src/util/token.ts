import type { Cipher, Decipher } from "node:crypto";
import crypto from "node:crypto";
import jwt from "jsonwebtoken";
import ms from "ms";
import type { IJwtPayload, IJwtVerifyOptions } from "src/common";
import { env } from "src/config";
import { forwardInSeconds } from "src/util/date";

export const aes256Encrypt = (
	data: string | Record<string, any> | Record<string, any>[],
	key: string,
	iv: string,
): string => {
	const cipher: Cipher = crypto.createCipheriv(env.jwtEncryptMethod, key, iv);
	return Buffer.from(
		cipher.update(JSON.stringify(data), "utf8", "hex") + cipher.final("hex"),
	).toString("base64");
};

export const aes256Decrypt = <
	T extends string | Record<string, any> | Record<string, any>[],
>(
	encrypted: string,
	key: string,
	iv: string,
): T => {
	const buff: Buffer = Buffer.from(encrypted, "base64");
	const decipher: Decipher = crypto.createDecipheriv(
		env.jwtEncryptMethod,
		key,
		iv,
	);
	return JSON.parse(
		decipher.update(buff.toString("utf8"), "hex", "utf8") +
			decipher.final("utf8"),
	);
};

export const jwtEncrypt = (
	payload: Record<string, any>,
	{ secretKey, ...options }: IJwtVerifyOptions,
): string => {
	return jwt.sign(payload, secretKey, { ...options });
};

export const createAccessToken = (payload: Record<string, any>) => {
	return jwtEncrypt(payload, {
		secretKey: env.jwtAccessTokenSecretKey,
		expiresIn: env.jwtAccessTokenExpired,
		notBefore: env.jwtAccessTokenNotBeforeExpiration,
		audience: env.jwtAudience,
		issuer: env.jwtIssuer,
		subject: env.jwtSubject,
	});
};

export const createRefreshToken = (payload: Record<string, any>) => {
	return jwtEncrypt(payload, {
		secretKey: env.jwtRefreshTokenSecretKey,
		expiresIn: env.jwtRefreshTokenExpired,
		notBefore: env.jwtRefreshTokenNotBeforeExpiration,
		audience: env.jwtAudience,
		issuer: env.jwtIssuer,
		subject: env.jwtSubject,
	});
};

export const verifyAccessToken = (token: string): IJwtPayload => {
	let decryptedToken: string = token;
	if (env.enbTokenEncrypt) {
		decryptedToken = aes256Decrypt(
			token,
			env.jwtPayloadAccessTokenEncryptKey,
			env.jwtPayloadAccessTokenEncryptIv,
		);
	}
	return jwt.verify(decryptedToken, env.jwtAccessTokenSecretKey) as IJwtPayload;
};

export const decryptActiveAccountToken = (
	token: string,
): {
	userId: string;
	expiredIn: number;
} => {
	const decrypt: any = aes256Decrypt(
		token,
		env.activeAccountTokenEncryptKey,
		env.activeAccountTokenEncryptIv,
	);
	return {
		userId: decrypt?.userId,
		expiredIn: Number.parseInt(decrypt?.expiredIn),
	};
};

export const createActiveAccountToken = (userId: string): string => {
	return aes256Encrypt(
		{
			userId,
			expiredIn: forwardInSeconds(ms(env.activeAccountTokenExpired)).getTime(),
		},
		env.activeAccountTokenEncryptKey,
		env.activeAccountTokenEncryptIv,
	);
};
