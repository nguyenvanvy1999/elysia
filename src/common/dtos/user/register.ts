import { t } from "elysia";
import { resDoc } from "src/common/dtos/response";
import { userDto } from "src/common/dtos/user/user";

export const registerBody = t.Pick(userDto, [
	"email",
	"password",
	"name",
	"username",
]);

export const registerRes = resDoc(t.Omit(userDto, ["password"]));
