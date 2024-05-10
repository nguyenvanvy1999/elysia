import { randomUUID } from "node:crypto";
import { eq, or } from "drizzle-orm";
import { Elysia } from "elysia";
import ms from "ms";
import {
	AUTH_ROUTES,
	DB_ID_PREFIX,
	type IJwtPayload,
	RES_KEY,
	ROUTES,
	SW_ROUTE_DETAIL,
	errorRes,
	errorsDefault,
	loginBody,
	loginRes,
	registerBody,
	registerRes,
	swaggerOptions,
} from "src/common";
import { HttpError, config, db, sessionRepository } from "src/config";
import { refreshTokens, users } from "src/db";
import { checkUserStatus, increasePasswordAttempt } from "src/service";
import {
	aes256Encrypt,
	checkPasswordExpired,
	comparePassword,
	createAccessToken,
	createPassword,
	createRefreshToken,
	dbIdGenerator,
	resBuild,
} from "src/util";

export const authRoutes = new Elysia({
	prefix: ROUTES.AUTH_V1,
	detail: { tags: [swaggerOptions.tags.auth.name] },
})
	.post(
		AUTH_ROUTES.REGISTER,
		async ({ body }): Promise<any> => {
			const exist = await db
				.select({ id: users.id, email: users.email, username: users.username })
				.from(users)
				.where(
					or(eq(users.email, body.email), eq(users.username, body.username)),
				)
				.limit(1);
			if (exist.length && exist[0].email) {
				throw HttpError.Conflict(...Object.values(RES_KEY.EMAIL_ALREADY_EXIST));
			}
			if (exist.length && exist[0].username) {
				throw HttpError.Conflict(
					...Object.values(RES_KEY.USERNAME_ALREADY_EXIST),
				);
			}

			const user = await db
				.insert(users)
				.values({
					...body,
					id: dbIdGenerator(DB_ID_PREFIX.USER),
					...createPassword(body.password),
				})
				.returning({
					id: users.id,
					email: users.email,
					name: users.username,
					username: users.username,
					avatarUrl: users.avatarUrl,
					status: users.status,
				});
			return resBuild(user, RES_KEY.REGISTER);
		},
		{
			body: registerBody,
			detail: SW_ROUTE_DETAIL.REGISTER,
			response: {
				201: registerRes,
				409: errorRes,
				...errorsDefault,
			},
		},
	)
	.post(
		AUTH_ROUTES.LOGIN,
		async ({ body }): Promise<any> => {
			const { email, password } = body;
			const foundUsers = await db
				.select({
					id: users.id,
					email: users.email,
					password: users.password,
					passwordAttempt: users.passwordAttempt,
					status: users.status,
					passwordExpired: users.passwordExpired,
					passwordSalt: users.passwordSalt,
				})
				.from(users)
				.where(eq(users.email, email))
				.limit(1);
			if (!foundUsers.length) {
				throw HttpError.NotFound(...Object.values(RES_KEY.USER_NOT_FOUND));
			}

			const user = foundUsers[0];
			if (
				config.enbPasswordAttempt &&
				user.passwordAttempt >= config.passwordAttempt
			) {
				throw HttpError.Forbidden(
					...Object.values(RES_KEY.USER_PASSWORD_ATTEMPT_MAX),
				);
			}
			const passwordMatch: boolean = comparePassword(
				password,
				user.password,
				user.passwordSalt,
			);
			if (!passwordMatch) {
				await increasePasswordAttempt(user.id);
				throw HttpError.BadRequest(
					...Object.values(RES_KEY.USER_PASSWORD_NOT_MATCH),
				);
			}
			checkUserStatus(user.status);
			const passwordExpired: boolean = checkPasswordExpired(
				user.passwordExpired,
			);
			if (config.enbPasswordExpired && passwordExpired) {
				throw HttpError.Forbidden(
					...Object.values(RES_KEY.USER_PASSWORD_EXPIRED),
				);
			}
			const accessSessionId: string = dbIdGenerator(DB_ID_PREFIX.SESSION);
			const refreshSessionId: string = randomUUID();
			let accessToken: string = createAccessToken({
				loginDate: new Date(),
				sessionId: accessSessionId,
			} satisfies IJwtPayload);
			let refreshToken: string = createRefreshToken({
				loginDate: new Date(),
				sessionId: refreshSessionId,
			} satisfies IJwtPayload);
			if (config.enbTokenEncrypt) {
				accessToken = aes256Encrypt(
					accessToken,
					config.jwtPayloadAccessTokenEncryptKey,
					config.jwtPayloadAccessTokenEncryptIv,
				);
				refreshToken = aes256Encrypt(
					refreshToken,
					config.jwtPayloadRefreshTokenEncryptKey,
					config.jwtPayloadRefreshTokenEncryptIv,
				);
			}

			await Promise.all([
				db.insert(refreshTokens).values({
					id: dbIdGenerator(DB_ID_PREFIX.REFRESH_TOKEN),
					userId: user.id,
					token: refreshSessionId,
					expires: new Date(Date.now() + ms(config.jwtRefreshTokenExpired)),
				}),
				sessionRepository.save(accessSessionId, {
					id: accessSessionId,
					userId: user.id,
				}),
			]);
			await sessionRepository.expireAt(
				accessSessionId,
				new Date(Date.now() + ms(config.jwtAccessTokenExpired)),
			);

			return resBuild(
				{
					accessToken,
					refreshToken,
				},
				RES_KEY.LOGIN,
			);
		},
		{
			body: loginBody,
			detail: SW_ROUTE_DETAIL.LOGIN,
			response: {
				200: loginRes,
				403: errorRes,
				404: errorRes,
				...errorsDefault,
			},
		},
	);
