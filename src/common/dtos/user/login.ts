import { t } from "elysia";
import { resDoc } from "src/common/dtos/response";
import { userDto } from "src/common/dtos/user/user";

export const loginBody = t.Pick(userDto, ["email", "password"]);

export const loginRes = resDoc(
	t.Object({
		accessToken: t.String(),
		refreshToken: t.String(),
	}),
);
