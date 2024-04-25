import { t } from "elysia";
import { PASSWORD_REGEX } from "src/common/constants";

export const registerBody = t.Object({
	email: t.String({ format: "email", required: true }),
	password: t.String({
		pattern: `${PASSWORD_REGEX}`,
	}),
	name: t.String(),
	username: t.String({ minLength: 6, maxLength: 32 }),
});
