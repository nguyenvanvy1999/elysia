import { t } from "elysia";
import { PASSWORD_REGEX, USER_STATUS } from "src/common/constants";

export const userDto = t.Object({
	id: t.String(),
	email: t.String({ format: "email", required: true }),
	password: t.String({
		pattern: PASSWORD_REGEX.source,
	}),
	name: t.String(),
	username: t.String({ minLength: 6, maxLength: 32 }),
	avatarUrl: t.String(),
	status: t.Enum(USER_STATUS),
});

export const userParam = t.Object({
	id: t.String(),
});
