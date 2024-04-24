import { eq, or } from "drizzle-orm";
import { Elysia } from "elysia";
import { DB_ID_PREFIX, registerBody, swaggerOptions } from "src/common";
import { httpErrorDecorator } from "src/config";
import { db } from "src/db";
import { users } from "src/db/schemas";
import { createPassword, dbIdGenerator } from "src/util";

export const authRoutes = new Elysia({
	prefix: "/v1/auth",
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
					emailVerified: null,
					id: dbIdGenerator(DB_ID_PREFIX.USER),
					avatarUrl: null,
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
	);
