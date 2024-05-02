import crypto from "node:crypto";
import jwt from "jsonwebtoken";
import type { IJwtVerifyOptions } from "src/common";
import { env } from "src/config";

export const aes256Encrypt = (
	data: string | Record<string, any> | Record<string, any>[],
	key: string,
	iv: string,
): string => {
	// key = crypto.createHash("sha512").update(key).digest("hex").substring(0, 32);
	// iv = crypto.createHash("sha512").update(iv).digest("hex").substring(0, 16);
	const cipher = crypto.createCipheriv(env.JWT_ENCRYPT_METHOD, key, iv);
	return Buffer.from(
		cipher.update(JSON.stringify(data), "utf8", "hex") + cipher.final("hex"),
	).toString("base64");
};

export const aes256Decrypt = (
	encrypted: string,
	key: string,
	iv: string,
): string | Record<string, any> | Record<string, any>[] => {
	const buff = Buffer.from(encrypted, "base64");
	const decipher = crypto.createDecipheriv(env.JWT_ENCRYPT_METHOD, key, iv);
	return (
		decipher.update(buff.toString("utf8"), "hex", "utf8") +
		decipher.final("utf8")
	);
};

export const jwtEncrypt = (
	payload: string | Record<string, any>,
	{ secretKey, ...options }: IJwtVerifyOptions,
): string => {
	return jwt.sign(payload, secretKey, { ...options });
};

export const createAccessToken = (payload: string | Record<string, any>) => {
	return jwtEncrypt(payload, {
		secretKey: env.JWT_ACCESS_TOKEN_SECRET_KEY,
		expiresIn: env.JWT_ACCESS_TOKEN_EXPIRED,
		notBefore: env.JWT_ACCESS_TOKEN_NOT_BEFORE_EXPIRATION,
		audience: env.JWT_AUDIENCE,
		issuer: env.JWT_ISSUER,
		subject: env.JWT_SUBJECT,
	});
};

export const createRefreshToken = (payload: string | Record<string, any>) => {
	return jwtEncrypt(payload, {
		secretKey: env.JWT_REFRESH_TOKEN_SECRET_KEY,
		expiresIn: env.JWT_REFRESH_TOKEN_EXPIRED,
		notBefore: env.JWT_REFRESH_TOKEN_NOT_BEFORE_EXPIRATION,
		audience: env.JWT_AUDIENCE,
		issuer: env.JWT_ISSUER,
		subject: env.JWT_SUBJECT,
	});
};
