import { asc, desc, eq } from "drizzle-orm";
import type { Static } from "elysia";
import {
	type IResponsePagingData,
	RES_KEY,
	type listDeviceQuery,
} from "src/common";
import { db } from "src/config";
import { type UserWithRoles, devices } from "src/db";
import {
	customCount,
	getCount,
	getLimit,
	getOffset,
	resPagingBuild,
} from "src/util";

interface IDeviceController {
	getList: ({
		user,
		query,
	}: {
		user: UserWithRoles;
		query: Static<typeof listDeviceQuery>;
	}) => Promise<IResponsePagingData>;
}

export const deviceController: IDeviceController = {
	getList: async ({
		user,
		query: { limit, offset },
	}): Promise<IResponsePagingData> => {
		limit = getLimit(limit);
		offset = getOffset(offset);
		const [data, count] = await Promise.all([
			db.query.devices.findMany({
				where: eq(devices.userId, user.id),
				columns: { sessionId: false, createdAt: false },
				orderBy: [desc(devices.logoutAt), asc(devices.loginAt)],
				limit,
				offset,
			}),
			db.select({ count: customCount() }).from(devices),
		]);

		return resPagingBuild(data, RES_KEY.LIST_DEVICES, {
			count: getCount(count),
			offset,
			limit,
		});
	},
};
