import { and, asc, eq, ilike, or } from "drizzle-orm";
import type { Static } from "elysia";
import { RES_KEY, type listPermissionQuery } from "src/common";
import { db } from "src/config";
import { permissions } from "src/db";
import { resBuild } from "src/util";

interface IPermissionController {
	getList: ({
		query,
	}: { query: Static<typeof listPermissionQuery> }) => Promise<any>;
}

export const permissionController: IPermissionController = {
	getList: async ({
		query: { search, entity, action, access },
	}): Promise<any> => {
		const data = await db
			.select()
			.from(permissions)
			.where(
				and(
					entity ? eq(permissions.entity, entity) : undefined,
					action ? eq(permissions.action, action) : undefined,
					access ? eq(permissions.access, access) : undefined,
					search?.length
						? or(
								ilike(permissions.entity, `%${search}%`),
								ilike(permissions.action, `%${search}%`),
								ilike(permissions.description, `%${search}%`),
								ilike(permissions.access, `%${search}%`),
							)
						: undefined,
				),
			)
			.orderBy(
				asc(permissions.entity),
				asc(permissions.action),
				asc(permissions.access),
			);

		return resBuild(data, RES_KEY.LIST_SETTING);
	},
};
