import type { Cipher, Decipher } from "node:crypto";
import crypto from "node:crypto";
import jwt from "jsonwebtoken";
import ms from "ms";
import type { IJwtPayload, IJwtVerifyOptions } from "src/common";
import { config } from "src/config";
import { forwardInMilliSeconds } from "src/util/date";

export const aes256Encrypt = (
	data: string | Record<string, any> | Record<string, any>[],
	key: string,
	iv: string,
): string => {
	const cipher: Cipher = crypto.createCipheriv(
		config.jwtEncryptMethod,
		key,
		iv,
	);
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
		config.jwtEncryptMethod,
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
		secretKey: config.jwtAccessTokenSecretKey,
		expiresIn: config.jwtAccessTokenExpired,
		notBefore: config.jwtAccessTokenNotBeforeExpiration,
		audience: config.jwtAudience,
		issuer: config.jwtIssuer,
		subject: config.jwtSubject,
	});
};

export const createRefreshToken = (payload: Record<string, any>) => {
	return jwtEncrypt(payload, {
		secretKey: config.jwtRefreshTokenSecretKey,
		expiresIn: config.jwtRefreshTokenExpired,
		notBefore: config.jwtRefreshTokenNotBeforeExpiration,
		audience: config.jwtAudience,
		issuer: config.jwtIssuer,
		subject: config.jwtSubject,
	});
};

export const verifyAccessToken = (token: string): IJwtPayload => {
	let decryptedToken: string = token;
	if (config.enbTokenEncrypt) {
		decryptedToken = aes256Decrypt(
			token,
			config.jwtPayloadAccessTokenEncryptKey,
			config.jwtPayloadAccessTokenEncryptIv,
		);
	}
	return jwt.verify(
		decryptedToken,
		config.jwtAccessTokenSecretKey,
	) as IJwtPayload;
};

export const decryptActiveAccountToken = (
	token: string,
): {
	userId: string;
	expiredIn: number;
} => {
	const decrypt: any = aes256Decrypt(
		token,
		config.activeAccountTokenEncryptKey,
		config.activeAccountTokenEncryptIv,
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
			expiredIn: forwardInMilliSeconds(
				ms(config.activeAccountTokenExpired),
			).getTime(),
		},
		config.activeAccountTokenEncryptKey,
		config.activeAccountTokenEncryptIv,
	);
};

export const decryptSetting = <T>(setting: string): T => {
	return aes256Decrypt(
		setting,
		config.settingEncryptKey,
		config.settingEncryptIv,
	) as T;
};

export const encryptSetting = (setting: any): string => {
	return aes256Encrypt(
		setting,
		config.settingEncryptKey,
		config.settingEncryptIv,
	);
};

export const createDeviceToken = (userId: string, deviceId: string): string => {
	return aes256Encrypt(
		{
			userId,
			deviceId,
			expiredIn: forwardInMilliSeconds(ms(config.deviceTokenExpired)).getTime(),
		},
		config.deviceTokenEncryptKey,
		config.deviceTokenEncryptIv,
	);
};

export const decryptDeviceToken = (
	token: string,
): {
	userId: string;
	expiredIn: number;
	deviceId: string;
} => {
	const decrypt: any = aes256Decrypt(
		token,
		config.deviceTokenEncryptKey,
		config.deviceTokenEncryptIv,
	);
	return {
		userId: decrypt?.userId,
		expiredIn: Number.parseInt(decrypt?.expiredIn),
		deviceId: decrypt?.deviceId,
	};
};

export const createMagicLoginToken = (userId: string): string => {
	return aes256Encrypt(
		{
			userId,
			expiredIn: forwardInMilliSeconds(
				ms(config.magicLoginTokenExpired),
			).getTime(),
		},
		config.magicLoginTokenEncryptKey,
		config.magicLoginTokenEncryptIv,
	);
};

export const decryptMagicLoginToken = (
	token: string,
): {
	userId: string;
	expiredIn: number;
} => {
	const decrypt: any = aes256Decrypt(
		token,
		config.magicLoginTokenEncryptKey,
		config.magicLoginTokenEncryptIv,
	);
	return {
		userId: decrypt?.userId,
		expiredIn: Number.parseInt(decrypt?.expiredIn),
	};
};
