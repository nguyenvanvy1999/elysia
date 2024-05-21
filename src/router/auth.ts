import { randomUUID } from "node:crypto";
import { and, eq, or } from "drizzle-orm";
import { Elysia } from "elysia";
import ms from "ms";
import {
	AUTH_ROUTES,
	DB_ID_PREFIX,
	type IJwtPayload,
	type IRequestDerive,
	RES_KEY,
	ROUTES,
	SETTING_KEY,
	SW_ROUTE_DETAIL,
	USER_STATUS,
	errorRes,
	errorsDefault,
	loginBody,
	loginRes,
	registerBody,
	registerRes,
	swaggerOptions,
} from "src/common";
import {
	HttpError,
	config,
	db,
	redisClient,
	sessionRepository,
} from "src/config";
import { devices, refreshTokens, users } from "src/db";
import { isAuthenticated } from "src/middleware";
import { checkUserStatus, increasePasswordAttempt } from "src/service";
import {
	aes256Encrypt,
	checkPasswordExpired,
	comparePassword,
	createAccessToken,
	createPassword,
	createRefreshToken,
	idGenerator,
	resBuild,
} from "src/util";

export const authRoutes = new Elysia<
	ROUTES.AUTH_V1,
	false,
	{
		derive: IRequestDerive;
		decorator: Record<string, unknown>;
		store: Record<string, unknown>;
		resolve: Record<string, unknown>;
	}
>({
	prefix: ROUTES.AUTH_V1,
	detail: { tags: [swaggerOptions.tags.auth.name] },
})
	.post(
		AUTH_ROUTES.REGISTER,
		async ({ body }): Promise<any> => {
			const enbRegister: string | null = await redisClient.get(
				SETTING_KEY.ENB_REGISTER,
			);
			if (enbRegister === "false") {
				throw HttpError.BadRequest(...Object.values(RES_KEY.DISABLE_REGISTER));
			}
			const { email, username, password } = body;
			const exist = await db.query.users.findFirst({
				where: or(eq(users.email, email), eq(users.username, username)),
				columns: { id: true, email: true, username: true },
			});
			if (exist?.email === email) {
				throw HttpError.Conflict(...Object.values(RES_KEY.EMAIL_ALREADY_EXIST));
			}
			if (exist?.username === username) {
				throw HttpError.Conflict(
					...Object.values(RES_KEY.USERNAME_ALREADY_EXIST),
				);
			}

			const user = await db
				.insert(users)
				.values({
					...body,
					id: idGenerator(DB_ID_PREFIX.USER),
					...createPassword(password),
					status: USER_STATUS.INACTIVE,
					activeAccountAt: null,
				})
				.returning({
					id: users.id,
					email: users.email,
					name: users.username,
					username: users.username,
					avatarUrl: users.avatarUrl,
					status: users.status,
				})
				.then((res) => res[0]);
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
		async ({ body, userAgent, ip }): Promise<any> => {
			const { email, password } = body;
			const user = await db.query.users.findFirst({
				where: eq(users.email, email),
				columns: {
					id: true,
					email: true,
					password: true,
					passwordAttempt: true,
					status: true,
					passwordExpired: true,
					passwordSalt: true,
				},
			});
			if (!user) {
				throw HttpError.NotFound(...Object.values(RES_KEY.USER_NOT_FOUND));
			}
			const [enbPasswordExpired, enbLoginNewDeviceCheck, enbPasswordAttempt] =
				await redisClient.mGet([
					SETTING_KEY.ENB_PASSWORD_EXPIRED,
					SETTING_KEY.ENB_LOGIN_NEW_DEVICE_CHECK,
					SETTING_KEY.ENB_PASSWORD_ATTEMPT,
				]);

			if (
				enbPasswordAttempt === "true" &&
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
			if (enbPasswordExpired === "true" && passwordExpired) {
				throw HttpError.Forbidden(
					...Object.values(RES_KEY.USER_PASSWORD_EXPIRED),
				);
			}

			if (enbLoginNewDeviceCheck === "true") {
				const ua = typeof userAgent === "string" ? userAgent : userAgent.ua;
				const isNewDevice = await db.query.devices.findFirst({
					where: and(eq(devices.ua, ua), eq(devices.userId, user.id)),
					columns: { userId: true, ua: true },
				});
				if (isNewDevice) {
					return resBuild(null, RES_KEY.LOGIN_NEW_DEVICE);
				}
			}

			const accessSessionId: string = idGenerator(DB_ID_PREFIX.SESSION);
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
					id: idGenerator(DB_ID_PREFIX.REFRESH_TOKEN),
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
	)
	.use(isAuthenticated)
	.post(
		AUTH_ROUTES.LOGOUT,
		async (): Promise<any> => {
			return resBuild(null, RES_KEY.LOGOUT);
		},
		{
			detail: {
				...SW_ROUTE_DETAIL.LOGOUT,
				security: [{ accessToken: [] }],
			},
			response: {
				200: loginRes,
				403: errorRes,
				404: errorRes,
				...errorsDefault,
			},
		},
	);
