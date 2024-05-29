import { t } from "elysia";
import {
	POLICY_ACCESS,
	POLICY_ACTION,
	POLICY_ENTITY,
} from "src/common/constants";

export const permissionDto = t.Object({
	id: t.String(),
	action: t.Enum(POLICY_ACTION),
	entity: t.Enum(POLICY_ENTITY),
	access: t.Enum(POLICY_ACCESS),
	description: t.Optional(t.String()),
	createdAt: t.Date(),
	updatedAt: t.Date(),
});
