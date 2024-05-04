import { type Mock, describe, expect, it, spyOn } from "bun:test";
import crypto from "node:crypto";
import jwt from "jsonwebtoken";
import type { IJwtPayload } from "src/common";
import { env } from "src/config";
import {
	aes256Decrypt,
	aes256Encrypt,
	createAccessToken,
	createRefreshToken,
	jwtEncrypt,
	verifyAccessToken,
} from "src/util";

interface IResponse {
	id: string;
	aud?: string;
	iss?: string;
	sub?: string;
	nbf?: number | string;
	exp?: string | number;
	iat: number;
}

describe("Util: Token testing", (): void => {
	describe("aes256Encrypt and aes256Decrypt", () => {
		const key: string = crypto
			.createHash("sha512")
			.update("key")
			.digest("hex")
			.substring(0, 32);
		const iv: string = crypto
			.createHash("sha512")
			.update("iv")
			.digest("hex")
			.substring(0, 16);
		it("Should encrypt and decrypt string data", (): void => {
			const data: string = "string_test";
			const encrypted: string = aes256Encrypt(data, key, iv);
			expect(encrypted).toBeString();
			const decrypt: string = aes256Decrypt<string>(encrypted, key, iv);
			expect(decrypt).toBeString();
			expect(decrypt).toBe(data);
		});
		it("Should encrypt and decrypt object data", (): void => {
			const data: Record<string, any> = { for: "bar", bar: 1 };
			const encrypted: string = aes256Encrypt(data, key, iv);
			expect(encrypted).toBeString();
			const decrypt: Record<string, any> = aes256Decrypt<Record<string, any>>(
				encrypted,
				key,
				iv,
			);
			expect(decrypt).toBeObject();
			expect(decrypt).toMatchObject(data);
		});
		it("Should encrypt and decrypt array object data", (): void => {
			const data: Record<string, any>[] = [
				{ for: "bar", bar: 1 },
				{ for1: "bar1", bar1: 2 },
			];
			const encrypted: string = aes256Encrypt(data, key, iv);
			expect(encrypted).toBeString();
			const decrypt: Record<string, any>[] = aes256Decrypt<
				Record<string, any>[]
			>(encrypted, key, iv);
			expect(decrypt).toBeObject();
			expect(decrypt).toMatchObject(data);
		});
		it("Should encrypt and decrypt object data", (): void => {
			const tst: Record<string, any> = { for: "bar", bar: 1 };
			const encrypted: string = aes256Encrypt(tst, key, iv);
			expect(typeof encrypted).toBe("string");
			const decrypt: Record<string, any> = aes256Decrypt<Record<string, any>>(
				encrypted,
				key,
				iv,
			);
			expect(typeof decrypt).toBe("object");
			expect(decrypt).toEqual(tst);
		});
	});

	describe("jwtEncrypt", (): void => {
		const secret: string = "test_secret";
		const issuer: string = "issuer";
		const subject: string = "subject";
		const audience: string = "audience";
		const notBefore: number = 0;
		const expiresIn: number = Date.now() + 1000 * 1000;
		interface IData {
			[key: string]: string;
		}

		const data: IData = { id: "test" };

		it("should encrypt and return token", (): void => {
			const token: string = jwtEncrypt(data, { secretKey: secret });
			expect(token).toBeString();
			const verify: IResponse = jwt.verify(token, secret) as IResponse;
			expect(verify).toBeObject();
			expect(verify.id).toEqual(data.id);
		});

		it("should encrypt with options and return token", (): void => {
			const token: string = jwtEncrypt(data, {
				secretKey: secret,
				issuer,
				audience,
				subject,
				notBefore,
				expiresIn,
			});
			expect(token).toBeString();
			const verify: IResponse = jwt.verify(token, secret) as IResponse;
			expect(verify).toBeObject();
			expect(verify.id).toEqual(data.id);
			expect(verify.iss).toEqual(issuer);
			expect(verify.aud).toEqual(audience);
			expect(verify.sub).toEqual(subject);
			expect(verify.nbf).toEqual(verify.iat);
			expect(verify.exp).toEqual(verify.iat + expiresIn);
		});
	});

	describe("createAccessToken", (): void => {
		const data: Record<string, any> = { id: "test" };
		it("should return access token", (): void => {
			const token: string = createAccessToken(data);
			expect(token).toBeString();
		});
	});

	describe("createRefreshToken", (): void => {
		const data: Record<string, any> = { id: "test" };
		it("should return refresh token", (): void => {
			const token: string = createRefreshToken(data);
			expect(token).toBeString();
		});
	});

	describe("verifyAccessToken", (): void => {
		const payload: Record<string, any> = { sessionId: "test" };
		const token: string = createAccessToken(payload);
		const expectRes = (verified: IJwtPayload): void => {
			expect(verified).toBeObject();
			expect(verified.sessionId).toEqual(payload.sessionId);
			expect(verified).toHaveProperty("iat");
			expect(verified).toHaveProperty("nbf");
			expect(verified).toHaveProperty("exp");
			expect(verified).toHaveProperty("aud");
			expect(verified).toHaveProperty("iss");
			expect(verified).toHaveProperty("sub");
		};

		const spy: Mock<any> = spyOn(env, "ENB_TOKEN_ENCRYPT");
		it("Should decrypt token and verify", (): void => {
			spy.mockReturnValue(true);
			const encryptToken: string = aes256Encrypt(
				token,
				env.JWT_PAYLOAD_ACCESS_TOKEN_ENCRYPT_KEY,
				env.JWT_PAYLOAD_ACCESS_TOKEN_ENCRYPT_IV,
			);
			const verified: IJwtPayload = verifyAccessToken(encryptToken);
			expectRes(verified);
		});
		it("Should verify token if not enable encrypt", (): void => {
			spy.mockReturnValue(false);
			const verified: IJwtPayload = verifyAccessToken(token);
			expectRes(verified);
		});
		it("Should throw error when token wrong", (): void => {
			expect(() => verifyAccessToken("wrong_token")).toThrowError();
		});
	});
});
