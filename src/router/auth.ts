import { compareSync } from "bcryptjs";
import { eq, or } from "drizzle-orm";
import { Elysia } from "elysia";
import {
	AUTH_ROUTES,
	DB_ID_PREFIX,
	RES_KEY,
	ROUTES,
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
import { db, env, httpErrorDecorator } from "src/config";
import { users } from "src/db";
import { increasePasswordAttempt } from "src/service";
import {
	checkPasswordExpired,
	createPassword,
	dbIdGenerator,
	resBuild,
} from "src/util";

export const authRoutes = new Elysia({
	prefix: ROUTES.AUTH_V1,
	detail: { tags: [swaggerOptions.tags.auth.name] },
})
	.use(httpErrorDecorator)
	.post(
		AUTH_ROUTES.REGISTER,
		async ({ body, HttpError }): Promise<any> => {
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
		async ({ body, HttpError }): Promise<any> => {
			const { email, password } = body;
			const foundUsers = await db
				.select({
					id: users.id,
					email: users.email,
					password: users.password,
					passwordAttempt: users.passwordAttempt,
					status: users.status,
					passwordExpired: users.passwordExpired,
				})
				.from(users)
				.where(eq(users.email, email))
				.limit(1);
			if (!foundUsers.length) {
				throw HttpError.NotFound(...Object.values(RES_KEY.USER_NOT_FOUND));
			}

			const user = foundUsers[0];
			if (
				env.ENB_PASSWORD_ATTEMPT &&
				user.passwordAttempt >= env.PASSWORD_ATTEMPT
			) {
				throw HttpError.Forbidden(
					...Object.values(RES_KEY.USER_PASSWORD_ATTEMPT_MAX),
				);
			}
			const passwordMatch: boolean = compareSync(password, user.password);
			if (!passwordMatch) {
				await increasePasswordAttempt(user.id);
				throw HttpError.BadRequest(
					...Object.values(RES_KEY.USER_PASSWORD_NOT_MATCH),
				);
			}
			switch (user.status) {
				case USER_STATUS.INACTIVE:
					throw HttpError.Forbidden(...Object.values(RES_KEY.USER_INACTIVE));
				case USER_STATUS.INACTIVE_PERMANENT:
					throw HttpError.Forbidden(
						...Object.values(RES_KEY.USER_INACTIVE_PERMANENT),
					);
				case USER_STATUS.BLOCK:
					throw HttpError.Forbidden(...Object.values(RES_KEY.USER_BLOCKED));
				default:
					break;
			}
			const passwordExpired: boolean = checkPasswordExpired(
				user.passwordExpired,
			);
			if (env.ENB_PASSWORD_EXPIRED && passwordExpired) {
				throw HttpError.Forbidden(
					...Object.values(RES_KEY.USER_PASSWORD_EXPIRED),
				);
			}
			return resBuild({ a: 1 }, RES_KEY.LOGIN);
		},
		{
			body: loginBody,
			detail: SW_ROUTE_DETAIL.LOGIN,
			response: {
				200: loginRes,
				409: errorRes,
				...errorsDefault,
			},
		},
	);
