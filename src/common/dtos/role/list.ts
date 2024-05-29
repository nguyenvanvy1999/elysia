import { t } from "elysia";
import { DEFAULT } from "src/common/constants";
import { resPagingDoc } from "src/common/dtos/response";
import { roleDto } from "src/common/dtos/role/role";

export const listRoleQuery = t.Object({
	limit: t.Optional(t.Numeric({ default: DEFAULT.PAGING_LIMIT, minimum: 1 })),
	offset: t.Optional(t.Numeric({ default: DEFAULT.PAGING_OFFSET, minimum: 0 })),
	search: t.Optional(t.String()),
});

export const listRoleRes = resPagingDoc(
	t.Pick(roleDto, ["id", "name", "description"]),
);
