import { t } from "elysia";
import { resDoc } from "src/common/dtos/response";
import { userDto } from "src/common/dtos/user/user";

export const userInfoRes = resDoc(t.Omit(userDto, ["password"]));
