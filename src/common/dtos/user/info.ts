import { t } from "elysia";
import { responseRes } from "src/common/dtos/response";
import { registerBody } from "src/common/dtos/user/register";

export const userInfoRes = responseRes(
	t.Intersect([
		t.Omit(registerBody, ["password"] as const),
		t.Object({ id: t.String(), avatarUrl: t.String() }),
	]),
);
