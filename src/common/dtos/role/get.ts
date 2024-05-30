import { t } from "elysia";
import { permissionDto } from "src/common/dtos/permission";
import { resDoc } from "src/common/dtos/response";
import { roleDto } from "src/common/dtos/role/role";

export const roleParam = t.Object({
	id: t.String(),
});

export const roleGetDetailRes = resDoc(
	t.Composite([
		t.Omit(roleDto, ["createdAt", "updatedAt"]),
		t.Object({
			permissions: t.Array(t.Omit(permissionDto, ["createdAt", "updatedAt"])),
		}),
	]),
);
