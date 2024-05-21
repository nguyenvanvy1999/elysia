import { eq } from "drizzle-orm";
import { Elysia } from "elysia";
import {
	BULL_JOB_ID_LENGTH,
	BULL_QUEUE,
	EMAIL_TYPE,
	type IEmailActiveAccount,
	type IEmailWelcome,
	RES_KEY,
	ROUTES,
	SW_ROUTE_DETAIL,
	USER_ROUTES,
	USER_STATUS,
	errorRes,
	errorsDefault,
	sendEmailVerifyBody,
	sendEmailVerifyRes,
	swaggerOptions,
	userInfoRes,
	verifyAccountQuery,
	verifyAccountRes,
} from "src/common";
import { HttpError, config, db, sendEmailQueue } from "src/config";
import { users } from "src/db";
import { isAuthenticated } from "src/middleware";
import {
	createActiveAccountToken,
	decryptActiveAccountToken,
	idGenerator,
	resBuild,
} from "src/util";

export const userRoutes = new Elysia({
	prefix: ROUTES.USER_V1,
	detail: { tags: [swaggerOptions.tags.user.name] },
})
	.post(
		USER_ROUTES.SEND_EMAIL_VERIFY,
		async ({ body }): Promise<any> => {
			const { email } = body;
			const user = await db.query.users.findFirst({
				where: eq(users.email, email),
				columns: {
					id: true,
					activeAccountToken: true,
					status: true,
				},
			});
			if (!user) {
				throw HttpError.NotFound(...Object.values(RES_KEY.USER_NOT_FOUND));
			}

			switch (user.status) {
				case USER_STATUS.ACTIVE:
					throw HttpError.Forbidden(
						...Object.values(RES_KEY.USER_HAS_BEEN_ACTIVATED),
					);
				case USER_STATUS.INACTIVE_PERMANENT:
					throw HttpError.Forbidden(
						...Object.values(RES_KEY.USER_INACTIVE_PERMANENT),
					);
				case USER_STATUS.BLOCK:
					throw HttpError.Forbidden(...Object.values(RES_KEY.USER_BLOCKED));
				default:
					break;
			}

			if (user.activeAccountToken) {
				const { expiredIn } = decryptActiveAccountToken(
					user.activeAccountToken,
				);
				if (Date.now() < expiredIn) {
					throw HttpError.BadRequest(
						...Object.values(RES_KEY.ACTIVE_ACCOUNT_EMAIL_RATE_LIMIT),
					);
				}
			} else {
				const newToken: string = createActiveAccountToken(user.id);
				await db
					.update(users)
					.set({ activeAccountToken: newToken })
					.where(eq(users.id, user.id));

				const jobId = idGenerator(BULL_QUEUE.SEND_MAIL, BULL_JOB_ID_LENGTH);
				const queueData = {
					email,
					emailType: EMAIL_TYPE.VERIFY_ACCOUNT,
					data: {
						url: encodeURI(
							`${config.appEndpoint}${ROUTES.USER_V1}${USER_ROUTES.ACTIVE_ACCOUNT}?token=${newToken}`,
						),
					},
				} satisfies IEmailActiveAccount;
				await sendEmailQueue.add(jobId, queueData, { jobId });
				return resBuild(null, RES_KEY.SEND_EMAIL_VERIFY_ACCOUNT);
			}
		},
		{
			body: sendEmailVerifyBody,
			detail: SW_ROUTE_DETAIL.SEND_EMAIL_VERIFY,
			response: {
				200: sendEmailVerifyRes,
				404: errorRes,
				...errorsDefault,
			},
		},
	)
	.get(
		USER_ROUTES.ACTIVE_ACCOUNT,
		async ({ query }): Promise<any> => {
			const { token } = query;
			if (!token) {
				throw HttpError.BadRequest(
					...Object.values(RES_KEY.ACTIVE_ACCOUNT_TOKEN_WRONG),
				);
			}
			const user = await db.query.users.findFirst({
				where: eq(users.activeAccountToken, token),
				columns: { id: true, email: true, name: true },
			});
			if (!user) {
				throw HttpError.NotFound(...Object.values(RES_KEY.USER_NOT_FOUND));
			}
			const { expiredIn } = decryptActiveAccountToken(token);
			if (Date.now() > expiredIn) {
				throw HttpError.BadRequest(
					...Object.values(RES_KEY.ACTIVE_ACCOUNT_TOKEN_WRONG),
				);
			}
			await db
				.update(users)
				.set({
					status: USER_STATUS.ACTIVE,
					activeAccountToken: null,
					activeAccountAt: new Date(),
				})
				.where(eq(users.id, user.id));

			const jobId = idGenerator(BULL_QUEUE.SEND_MAIL, BULL_JOB_ID_LENGTH);
			const queueData = {
				email: user.email,
				emailType: EMAIL_TYPE.WELCOME,
				data: { name: user.name ?? "" },
			} satisfies IEmailWelcome;
			await sendEmailQueue.add(jobId, queueData, { jobId });
			return resBuild(null, RES_KEY.SEND_EMAIL_VERIFY_ACCOUNT);
		},
		{
			query: verifyAccountQuery,
			detail: SW_ROUTE_DETAIL.VERIFY_ACCOUNT,
			response: {
				200: verifyAccountRes,
				404: errorRes,
				...errorsDefault,
			},
		},
	)
	.use(isAuthenticated)
	.get(
		USER_ROUTES.INFO,
		async ({ user }): Promise<any> => {
			return resBuild(
				{
					id: user.id,
					email: user.email,
					username: user.username,
					avatarUrl: user.avatarUrl,
					name: user.name,
					status: user.status,
				},
				RES_KEY.USER_INFO,
			);
		},
		{
			detail: {
				...SW_ROUTE_DETAIL.USER_INFO,
				security: [{ accessToken: [] }],
			},
			response: {
				200: userInfoRes,
				401: errorRes,
				...errorsDefault,
			},
		},
	);
