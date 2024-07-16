import { t } from "elysia";
import {
	DEFAULT,
	POLICY_ACCESS,
	POLICY_ACTION,
	POLICY_ENTITY,
} from "src/common/constants";
import { permissionDto } from "src/common/dtos/permission/permission";
import { resDoc, resPagingDoc } from "src/common/dtos/response";

export const listPermissionQuery = t.Object({
	limit: t.Optional(t.Numeric({ default: DEFAULT.PAGING_LIMIT, minimum: 1 })),
	offset: t.Optional(t.Numeric({ default: DEFAULT.PAGING_OFFSET, minimum: 0 })),
	search: t.Optional(t.String()),
	entity: t.Optional(t.Enum(POLICY_ENTITY)),
	action: t.Optional(t.Enum(POLICY_ACTION)),
	access: t.Optional(t.Enum(POLICY_ACCESS)),
});

export const listPermissionRes = resPagingDoc(permissionDto);

export const permissionRes = resDoc(permissionDto);
