import { t } from "elysia";
import { responseRes } from "src/common/dtos/response";
import { userDto } from "src/common/dtos/user/user";

export const userInfoRes = responseRes(t.Omit(userDto, ["password"]));
