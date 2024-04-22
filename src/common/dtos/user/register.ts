import { t } from "elysia";

export const registerBody = t.Object({
	email: t.String({ format: "email", required: true }),
	password: t.String({
		pattern: "^(?=.*?[A-Z])(?=.*?[a-z])(?=.*?[0-9])(?=.*?[#?!@$%^&*-]).{8,}$",
	}),
	name: t.String(),
	username: t.String({ minLength: 6, maxLength: 32 }),
});
