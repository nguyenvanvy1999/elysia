import { t } from "elysia";
import { resDoc } from "src/common/dtos/response";
import { roleDto } from "src/common/dtos/role/role";

export const deleteRoleRes = resDoc(t.Pick(roleDto, ["id"]));
