import { t } from "elysia";
import { responseRes } from "src/common/dtos/response";
import { registerBody } from "src/common/dtos/user/register";

export const loginBody = t.Pick(registerBody, ["email", "password"]);

export const loginRes = responseRes(t.Null());
