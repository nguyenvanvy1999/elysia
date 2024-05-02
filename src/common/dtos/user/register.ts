import { t } from "elysia";
import { PASSWORD_REGEX } from "src/common/constants";
import { responseRes } from "src/common/dtos/response";

export const registerBody = t.Object({
	email: t.String({ format: "email", required: true }),
	password: t.String({
		pattern: PASSWORD_REGEX.source,
	}),
	name: t.String(),
	username: t.String({ minLength: 6, maxLength: 32 }),
});

export const registerRes = responseRes(
	t.Intersect([
		t.Omit(registerBody, ["password"] as const),
		t.Object({ id: t.String(), avatarUrl: t.String() }),
	]),
);
