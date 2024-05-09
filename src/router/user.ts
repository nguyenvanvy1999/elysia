import { eq } from "drizzle-orm";
import { Elysia } from "elysia";
import {
	RES_KEY,
	ROUTES,
	SW_ROUTE_DETAIL,
	USER_ROUTES,
	errorRes,
	errorsDefault,
	sendEmailVerifyBody,
	sendEmailVerifyRes,
	swaggerOptions,
	userInfoRes,
} from "src/common";
import { HttpError, db } from "src/config";
import { users } from "src/db";
import { isAuthenticated } from "src/middleware";
import {
	createActiveAccountToken,
	decryptActiveAccountToken,
	resBuild,
} from "src/util";

export const userRoutes = new Elysia({
	prefix: ROUTES.USER_V1,
	detail: { tags: [swaggerOptions.tags.user.name] },
})
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
	)
	.post(
		USER_ROUTES.SEND_EMAIL_VERIFY,
		async ({ body }): Promise<any> => {
			const { email } = body;
			const foundUsers = await db
				.select({ id: users.id, activeAccountToken: users.activeAccountToken })
				.from(users)
				.where(eq(users.email, email));
			if (!foundUsers.length) {
				throw HttpError.NotFound(...Object.values(RES_KEY.USER_NOT_FOUND));
			}
			const user = foundUsers[0];
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
				const updatedUsers = await db
					.update(users)
					.set({ activeAccountToken: newToken })
					.where(eq(users.id, user.id))
					.returning({
						id: users.id,
						email: users.email,
						activeAccountToken: users.activeAccountToken,
					});
				// todo: send event send email here
				// const eventData: IUserCreatedEvent = { user: updatedUser };
				// this.eventEmitter.emit(ENUM_EVENT.USER_SEND_EMAIL_ACTIVE, eventData);
			}
		},
		{
			body: sendEmailVerifyBody,
			detail: SW_ROUTE_DETAIL.SEND_EMAIL_VERIFY,
			response: {
				200: sendEmailVerifyRes,
				401: errorRes,
				...errorsDefault,
			},
		},
	);
