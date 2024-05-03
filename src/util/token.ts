import type { Cipher, Decipher } from "node:crypto";
import crypto from "node:crypto";
import jwt from "jsonwebtoken";
import type { IJwtPayload, IJwtVerifyOptions } from "src/common";
import { env } from "src/config";

export const aes256Encrypt = (
	data: string | Record<string, any> | Record<string, any>[],
	key: string,
	iv: string,
): string => {
	const cipher: Cipher = crypto.createCipheriv(env.JWT_ENCRYPT_METHOD, key, iv);
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
		env.JWT_ENCRYPT_METHOD,
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
		secretKey: env.JWT_ACCESS_TOKEN_SECRET_KEY,
		expiresIn: env.JWT_ACCESS_TOKEN_EXPIRED,
		notBefore: env.JWT_ACCESS_TOKEN_NOT_BEFORE_EXPIRATION,
		audience: env.JWT_AUDIENCE,
		issuer: env.JWT_ISSUER,
		subject: env.JWT_SUBJECT,
	});
};

export const createRefreshToken = (payload: Record<string, any>) => {
	return jwtEncrypt(payload, {
		secretKey: env.JWT_REFRESH_TOKEN_SECRET_KEY,
		expiresIn: env.JWT_REFRESH_TOKEN_EXPIRED,
		notBefore: env.JWT_REFRESH_TOKEN_NOT_BEFORE_EXPIRATION,
		audience: env.JWT_AUDIENCE,
		issuer: env.JWT_ISSUER,
		subject: env.JWT_SUBJECT,
	});
};

export const verifyAccessToken = (token: string): IJwtPayload => {
	let decryptedToken: string = token;
	if (env.ENB_TOKEN_ENCRYPT) {
		decryptedToken = aes256Decrypt(
			token,
			env.JWT_PAYLOAD_ACCESS_TOKEN_ENCRYPT_KEY,
			env.JWT_PAYLOAD_ACCESS_TOKEN_ENCRYPT_IV,
		);
	}
	return jwt.verify(
		decryptedToken,
		env.JWT_ACCESS_TOKEN_SECRET_KEY,
	) as IJwtPayload;
};
