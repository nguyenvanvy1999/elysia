import { eq } from "drizzle-orm";
import type { Static } from "elysia";
import {
	BULL_JOB_ID_LENGTH,
	BULL_QUEUE,
	EMAIL_TYPE,
	type IEmailActiveAccount,
	type IEmailWelcome,
	RES_KEY,
	ROUTES,
	USER_ROUTES,
	USER_STATUS,
	type sendEmailVerifyBody,
	type verifyAccountQuery,
} from "src/common";
import { HttpError, config, db, sendEmailQueue } from "src/config";
import { type UserWithRoles, users } from "src/db";
import {
	createActiveAccountToken,
	decryptActiveAccountToken,
	idGenerator,
	resBuild,
} from "src/util";

type IUserController = {
	sendEmailVerifyAccount: ({
		body,
	}: { body: Static<typeof sendEmailVerifyBody> }) => Promise<any>;

	activeAccount: ({
		query,
	}: { query: Static<typeof verifyAccountQuery> }) => Promise<any>;

	userInfo: ({ user }: { user: UserWithRoles }) => Promise<any>;
};

export const userController: IUserController = {
	sendEmailVerifyAccount: async ({ body }): Promise<any> => {
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
			const { expiredIn } = decryptActiveAccountToken(user.activeAccountToken);
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

	activeAccount: async ({ query }): Promise<any> => {
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
			data: { name: user.name ?? "", url: config.appEndpoint },
		} satisfies IEmailWelcome;
		await sendEmailQueue.add(jobId, queueData, { jobId });
		return resBuild(null, RES_KEY.VERIFY_ACCOUNT);
	},

	userInfo: async ({ user }): Promise<any> => {
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
};
