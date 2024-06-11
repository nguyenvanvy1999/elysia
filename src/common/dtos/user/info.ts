import { t } from "elysia";
import { permissionDto } from "src/common/dtos/permission";
import { resDoc } from "src/common/dtos/response";
import { roleDto } from "src/common/dtos/role";
import { userDto } from "src/common/dtos/user/user";

export const userInfoRes = resDoc(
	t.Composite([
		t.Omit(userDto, ["password"]),
		t.Object({
			roles: t.Array(
				t.Composite([
					t.Omit(roleDto, ["createdAt", "updatedAt"]),
					t.Object({
						permissions: t.Array(
							t.Omit(permissionDto, ["createdAt", "updatedAt"]),
						),
					}),
				]),
			),
		}),
	]),
);
