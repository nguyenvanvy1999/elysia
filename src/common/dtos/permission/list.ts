import { t } from "elysia";
import {
	POLICY_ACCESS,
	POLICY_ACTION,
	POLICY_ENTITY,
} from "src/common/constants";
import { permissionDto } from "src/common/dtos/permission/permission";
import { resDoc } from "src/common/dtos/response";

export const listPermissionQuery = t.Object({
	search: t.Optional(t.String()),
	entity: t.Optional(t.Enum(POLICY_ENTITY)),
	action: t.Optional(t.Enum(POLICY_ACTION)),
	access: t.Optional(t.Enum(POLICY_ACCESS)),
});

export const listPermissionRes = resDoc(t.Array(permissionDto));

export const permissionRes = resDoc(permissionDto);
