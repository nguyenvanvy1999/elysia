import { t } from "elysia";
import { roleDto } from "src/common/dtos/role/role";

export const createRoleBody = t.Composite([
	t.Omit(roleDto, ["createdAt", "updatedAt", "id"]),
	t.Object({
		permissionIds: t.Array(t.String(), { min: 1 }),
	}),
]);
