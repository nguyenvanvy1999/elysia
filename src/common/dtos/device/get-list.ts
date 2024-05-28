import { t } from "elysia";
import { DEFAULT } from "src/common/constants";
import { deviceDto } from "src/common/dtos/device/device";
import { resPagingDoc } from "src/common/dtos/response";

export const listDeviceQuery = t.Object({
	limit: t.Optional(t.Numeric({ default: DEFAULT.PAGING_LIMIT, minimum: 1 })),
	offset: t.Optional(t.Numeric({ default: DEFAULT.PAGING_OFFSET, minimum: 0 })),
});

export const listDeviceRes = resPagingDoc(deviceDto);
