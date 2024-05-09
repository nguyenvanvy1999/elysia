import { t } from "elysia";
import { responseRes } from "src/common/dtos/response";
import { userDto } from "src/common/dtos/user/user";

export const sendEmailVerifyBody = t.Pick(userDto, ["email"]);

export const sendEmailVerifyRes = responseRes(t.Null());
