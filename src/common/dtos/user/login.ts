import { t } from "elysia";
import { responseRes } from "src/common/dtos/response";
import { userDto } from "src/common/dtos/user/user";

export const loginBody = t.Pick(userDto, ["email", "password"]);

export const loginRes = responseRes(
	t.Object({
		accessToken: t.String(),
		refreshToken: t.String(),
	}),
);
