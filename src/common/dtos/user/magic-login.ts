import { t } from "elysia";
import { resDoc } from "src/common/dtos/response";
import { loginRes } from "src/common/dtos/user/login";
import { userDto } from "src/common/dtos/user/user";

export const sendMagicLinkBody = t.Pick(userDto, ["email"]);

export const sendMagicLinkRes = resDoc(t.Omit(userDto, ["id"]));

export const magicLoginQuery = t.Object({
	token: t.String(),
});

export const magicLoginRes = loginRes;
