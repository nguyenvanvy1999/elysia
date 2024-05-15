import { t } from "elysia";
import { DEFAULT } from "src/common/constants";

export const listSettingQuery = t.Object({
	limit: t.Optional(t.Numeric({ default: DEFAULT.PAGING_LIMIT, minimum: 1 })),
	offset: t.Optional(t.Numeric({ default: DEFAULT.PAGING_OFFSET, minimum: 0 })),
});
