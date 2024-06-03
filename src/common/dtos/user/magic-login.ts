import { t } from "elysia";
import { resDoc } from "src/common/dtos/response";
import { userDto } from "src/common/dtos/user/user";

export const sendMagicLinkBody = t.Pick(userDto, ["email"]);

export const sendMagicLinkRes = resDoc(t.Omit(userDto, ["id"]));
