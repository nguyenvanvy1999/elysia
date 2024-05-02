import { eq, or } from "drizzle-orm";
import { Elysia } from "elysia";
import {
	DB_ID_PREFIX,
	type IResponseData,
	RES_KEY,
	registerBody,
	registerRes,
	swaggerOptions,
} from "src/common";
import { errorRes } from "src/common/dtos/response";
import { db, httpErrorDecorator } from "src/config";
import { users } from "src/db";
import { createPassword, dbIdGenerator } from "src/util";

export const authRoutes = new Elysia({
	prefix: "api/v1/auth",
	detail: { tags: [swaggerOptions.tags.auth.name] },
})
	.use(httpErrorDecorator)
	.post(
		"/register",
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

			return db
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
		},
		{
			body: registerBody,
			detail: {
				description: "Register new user with role user",
				summary: "Register",
			},
			response: {
				201: registerRes,
				400: errorRes,
				409: errorRes,
			},
		},
	)
	.post(
		"/login",
		() => {
			return {
				message: "hello",
				data: { test: 1 },
				code: "test123",
			} satisfies IResponseData;
		},
		{
			detail: {
				description: "Login with email and password",
				summary: "Login",
			},
		},
	);
