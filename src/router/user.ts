import { eq } from "drizzle-orm";
import { Elysia } from "elysia";
import {
	BULL_JOB_ID_LENGTH,
	BULL_QUEUE,
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
				await sendEmailQueue.add(
					jobId,
					{
						email,
						url: encodeURI(
							`${config.appEndpoint}${ROUTES.USER_V1}${USER_ROUTES.ACTIVE_ACCOUNT}?token=${newToken}`,
						),
					},
					{ jobId },
				);
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
			detail: SW_ROUTE_DETAIL.USER_INFO,
			response: {
				200: userInfoRes,
				401: errorRes,
				...errorsDefault,
			},
		},
	);
