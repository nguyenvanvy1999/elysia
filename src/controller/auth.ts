import { randomUUID } from "node:crypto";
import type { SocketAddress } from "bun";
import { and, eq, or } from "drizzle-orm";
import type { Static } from "elysia";
import ms from "ms";
import {
	AUTH_ROUTES,
	BULL_JOB_ID_LENGTH,
	BULL_QUEUE,
	DB_ID_PREFIX,
	EMAIL_TYPE,
	type IEmailLoginNewDevice,
	type IEmailMagicLogin,
	type IEmailVerifyLoginNewDevice,
	type IEmailWarningPasswordAttempt,
	type IJwtPayload,
	LOGIN_METHOD,
	RES_KEY,
	ROLE_NAME,
	ROUTES,
	SETTING_KEY,
	USER_STATUS,
	type confirmDeviceQuery,
	type loginBody,
	type logoutDeviceQuery,
	type registerBody,
	type sendMagicLinkBody,
} from "src/common";
import {
	HttpError,
	config,
	db,
	redisClient,
	sendEmailQueue,
	sessionRepository,
} from "src/config";
import {
	type UserWithRoles,
	devices,
	refreshTokens,
	roles,
	users,
	usersToRoles,
} from "src/db";
import { sessionService, userService } from "src/service";
import {
	aes256Encrypt,
	checkPasswordExpired,
	comparePassword,
	createAccessToken,
	createDeviceToken,
	createMagicLoginToken,
	createPassword,
	createRefreshToken,
	decryptActiveAccountToken,
	decryptDeviceToken,
	idGenerator,
	resBuild,
} from "src/util";
import type { IResult } from "ua-parser-js";

interface IAuthController {
	register: ({ body }: { body: Static<typeof registerBody> }) => Promise<any>;

	login: ({
		body,
		userAgent,
		ip,
	}: {
		body: Static<typeof loginBody>;
		userAgent?: IResult;
		ip: SocketAddress | string | null | undefined;
	}) => Promise<any>;

	sendMagicLink: ({
		body,
	}: {
		body: Static<typeof sendMagicLinkBody>;
	}) => Promise<any>;

	logout: ({
		sessionId,
		refreshSessionId,
	}: {
		sessionId: string;
		refreshSessionId?: string;
	}) => Promise<any>;

	logoutDevice: ({
		query,
		user,
	}: {
		query: Static<typeof logoutDeviceQuery>;
		user: UserWithRoles;
	}) => Promise<any>;

	logoutAll: ({
		user,
	}: {
		user: UserWithRoles;
	}) => Promise<any>;

	confirmDevice: ({
		query,
	}: { query: Static<typeof confirmDeviceQuery> }) => Promise<any>;
}

export const authController: IAuthController = {
	sendMagicLink: async ({ body: { email } }): Promise<any> => {
		const user = await db.query.users.findFirst({
			where: eq(users.email, email),
			columns: {
				id: true,
				email: true,
				status: true,
				magicLoginToken: true,
			},
		});
		if (!user) {
			throw HttpError.NotFound(...Object.values(RES_KEY.USER_NOT_FOUND));
		}
		userService.checkUserStatus(user.status);

		if (user.magicLoginToken) {
			const { expiredIn } = decryptActiveAccountToken(user.magicLoginToken);
			if (Date.now() < expiredIn) {
				throw HttpError.BadRequest(
					...Object.values(RES_KEY.MAGIC_LOGIN_EMAIL_RATE_LIMIT),
				);
			}
		} else {
			const newToken: string = createMagicLoginToken(user.id);
			await db
				.update(users)
				.set({ magicLoginToken: newToken })
				.where(eq(users.id, user.id));

			const jobId = idGenerator(BULL_QUEUE.SEND_MAIL, BULL_JOB_ID_LENGTH);
			const queueData = {
				email,
				emailType: EMAIL_TYPE.MAGIC_LOGIN,
				data: {
					url: encodeURI(
						`${config.appEndpoint}${ROUTES.AUTH_V1}${AUTH_ROUTES.MAGIC_LOGIN}?token=${newToken}`,
					),
				},
			} satisfies IEmailMagicLogin;
			await sendEmailQueue.add(jobId, queueData, { jobId });

			return resBuild({ id: user.id }, RES_KEY.SEND_MAGIC_LINK);
		}
	},

	register: async ({ body }): Promise<any> => {
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
		const userRole = await db.query.roles.findFirst({
			where: eq(roles.name, ROLE_NAME.USER),
			columns: { id: true },
		});
		if (!userRole) {
			throw HttpError.Internal(...Object.values(RES_KEY.INTERNAL_SERVER_ERROR));
		}

		const user = await db.transaction(async (ct) => {
			const userRes = await ct
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
			await ct
				.insert(usersToRoles)
				.values({ userId: userRes.id, roleId: userRole.id });
			return userRes;
		});
		return resBuild(user, RES_KEY.REGISTER);
	},

	login: async ({ body, userAgent, ip }): Promise<any> => {
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
				SETTING_KEY.ENB_LOGIN_NEW_DEVICE_VERIFY,
				SETTING_KEY.ENB_PASSWORD_ATTEMPT,
			]);

		if (
			enbPasswordAttempt === "true" &&
			user.passwordAttempt >= config.passwordAttempt
		) {
			const jobId = idGenerator(BULL_QUEUE.SEND_MAIL, BULL_JOB_ID_LENGTH);
			const queueData = {
				email,
				emailType: EMAIL_TYPE.WARNING_PASSWORD_ATTEMPT,
				data: {},
			} satisfies IEmailWarningPasswordAttempt;
			await sendEmailQueue.add(jobId, queueData, { jobId });

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
			await userService.increasePasswordAttempt(user.id);
			throw HttpError.BadRequest(
				...Object.values(RES_KEY.USER_PASSWORD_NOT_MATCH),
			);
		}

		await userService.resetPasswordAttempt(user.id);

		userService.checkUserStatus(user.status);

		const passwordExpired: boolean = checkPasswordExpired(user.passwordExpired);
		if (enbPasswordExpired === "true" && passwordExpired) {
			throw HttpError.Forbidden(
				...Object.values(RES_KEY.USER_PASSWORD_EXPIRED),
			);
		}

		const accessSessionId: string = idGenerator(DB_ID_PREFIX.SESSION);
		const refreshSessionId: string = randomUUID();
		let accessToken: string = createAccessToken({
			loginDate: new Date(),
			sessionId: accessSessionId,
			refreshSessionId,
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
				refreshSessionId,
			}),
		]);
		await sessionRepository.expireAt(
			accessSessionId,
			new Date(Date.now() + ms(config.jwtAccessTokenExpired)),
		);

		if (!userAgent) {
			throw HttpError.BadRequest(
				...Object.values(RES_KEY.INTERNAL_SERVER_ERROR),
			);
		}

		const existDevice = await db.query.devices.findFirst({
			where: and(eq(devices.ua, userAgent.ua), eq(devices.userId, user.id)),
			columns: { userId: true, ua: true, id: true },
		});
		if (!existDevice) {
			const sendEmailData = {
				ipAddress: typeof ip === "string" ? ip : ip?.address,
				deviceType: userAgent.device.type,
				deviceVendor: userAgent.device.vendor,
				deviceModel: userAgent.device.model,
				os: userAgent.os.name,
				osVersion: userAgent.os.version,
				browserName: userAgent.browser.name,
				browserVersion: userAgent.browser.version,
			};
			const jobId = idGenerator(BULL_QUEUE.SEND_MAIL, BULL_JOB_ID_LENGTH);
			const deviceId = idGenerator(DB_ID_PREFIX.DEVICE);
			const deviceData = {
				id: deviceId,
				ua: userAgent.ua,
				...userAgent.device,
				os: userAgent.os.name,
				osVersion: userAgent.os.version,
				browserName: userAgent.browser.name,
				browserVersion: userAgent.browser.version,
				engineName: userAgent.engine.name,
				engineVersion: userAgent.engine.version,
				cpuArchitecture: userAgent.cpu.architecture,
				ipAddress: typeof ip === "string" ? ip : ip?.address,
			};

			// new device and enable verify new device login
			if (enbLoginNewDeviceCheck === "true") {
				const queueData = {
					email,
					emailType: EMAIL_TYPE.VERIFY_LOGIN_NEW_DEVICE,
					data: {
						url: encodeURI(
							`${config.appEndpoint}${ROUTES.AUTH_V1}${
								AUTH_ROUTES.CONFIRM_DEVICE
							}?token=${createDeviceToken(user.id, deviceId)}`,
						),
						...sendEmailData,
					},
				} satisfies IEmailVerifyLoginNewDevice;
				await Promise.allSettled([
					sendEmailQueue.add(jobId, queueData, { jobId }),
					db.insert(devices).values(deviceData),
				]);
				return resBuild(
					{
						accessToken: null,
						refreshToken: null,
					},
					RES_KEY.LOGIN_NEW_DEVICE,
				);
			}

			// new device and disable verify new device login
			const queueData = {
				email,
				emailType: EMAIL_TYPE.LOGIN_NEW_DEVICE,
				data: sendEmailData,
			} satisfies IEmailLoginNewDevice;
			await Promise.allSettled([
				sendEmailQueue.add(jobId, queueData, { jobId }),
				db.insert(devices).values({
					userId: user.id,
					...deviceData,
					sessionId: refreshSessionId,
					loginAt: new Date(),
					loginMethod: LOGIN_METHOD.PASSWORD,
				}),
			]);
		} else {
			// old device
			await db
				.update(devices)
				.set({ sessionId: refreshSessionId })
				.where(eq(devices.id, existDevice.id));
		}

		return resBuild(
			{
				accessToken,
				refreshToken,
			},
			RES_KEY.LOGIN,
		);
	},

	logout: async ({ sessionId, refreshSessionId }): Promise<any> => {
		await Promise.allSettled([
			sessionService.removeSessionById(sessionId),
			db
				.delete(refreshTokens)
				.where(eq(refreshTokens.token, refreshSessionId ?? "")),
			db
				.update(devices)
				.set({ sessionId: null, logoutAt: new Date() })
				.where(eq(devices.sessionId, refreshSessionId ?? "")),
		]);
		return resBuild(null, RES_KEY.LOGOUT);
	},

	logoutAll: async ({ user }): Promise<any> => {
		await Promise.allSettled([
			sessionService.removeSessionByUserId(user.id),
			db.delete(refreshTokens).where(eq(refreshTokens.userId, user.id)),
			db
				.update(devices)
				.set({ sessionId: null, logoutAt: new Date() })
				.where(eq(devices.userId, user.id)),
		]);
		return resBuild(null, RES_KEY.LOGOUT_ALL);
	},

	logoutDevice: async ({ user, query: { deviceId } }): Promise<any> => {
		const device = await db.query.devices.findFirst({
			where: and(eq(devices.id, deviceId), eq(devices.userId, user.id)),
			columns: { sessionId: true },
		});
		if (!device) {
			throw HttpError.NotFound(...Object.values(RES_KEY.DEVICE_NOT_FOUND));
		}
		if (device.sessionId) {
			await Promise.allSettled([
				sessionService.removeSessionByRefreshId(device.sessionId),
				db
					.delete(refreshTokens)
					.where(eq(refreshTokens.token, device.sessionId)),
				db
					.update(devices)
					.set({ sessionId: null, logoutAt: new Date() })
					.where(eq(devices.id, deviceId)),
			]);
		}
		return resBuild(null, RES_KEY.LOGOUT_DEVICE);
	},

	confirmDevice: async ({ query }): Promise<any> => {
		const { token } = query;
		if (!token) {
			throw HttpError.BadRequest(...Object.values(RES_KEY.DEVICE_TOKEN_WRONG));
		}
		const { expiredIn, userId, deviceId } = decryptDeviceToken(token);
		if (Date.now() > expiredIn) {
			throw HttpError.BadRequest(...Object.values(RES_KEY.DEVICE_TOKEN_WRONG));
		}
		await db
			.update(devices)
			.set({
				userId,
			})
			.where(eq(devices.id, deviceId));
		return resBuild(null, RES_KEY.VERIFY_ACCOUNT);
	},
};
