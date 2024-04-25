import { eq, or } from "drizzle-orm";
import { Elysia } from "elysia";
import { DB_ID_PREFIX, registerBody, swaggerOptions } from "src/common";
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
		async ({ body, HttpError }) => {
			const exist = await db
				.select({ id: users.id, email: users.email, username: users.username })
				.from(users)
				.where(
					or(eq(users.email, body.email), eq(users.username, body.username)),
				)
				.limit(1);
			if (exist.length && exist[0].email) {
				throw HttpError.Conflict("Email already exists");
			}
			if (exist.length && exist[0].username) {
				throw HttpError.Conflict("Username already exists");
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
					emailVerified: users.emailVerified,
					createdAt: users.createdAt,
					updatedAt: users.updatedAt,
					avatarUrl: users.avatarUrl,
				});
		},
		{
			body: registerBody,
			detail: {
				description: "Register new user with role user",
				summary: "Register",
			},
		},
	)
	.post(
		"/login",
		() => {
			return { test: 1 };
		},
		{
			detail: {
				description: "Login with email and password",
				summary: "Login",
			},
		},
	);
