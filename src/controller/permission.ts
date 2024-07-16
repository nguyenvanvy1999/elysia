import { and, asc, eq, ilike, or } from "drizzle-orm";
import type { Static } from "elysia";
import {
	type IResponseData,
	RES_KEY,
	type listPermissionQuery,
	type permissionParam,
} from "src/common";
import type { updatePermissionBody } from "src/common/dtos/permission/update";
import { HttpError, db } from "src/config";
import { permissions } from "src/db";
import { resBuild } from "src/util";

interface IPermissionController {
	getList: ({
		query,
	}: { query: Static<typeof listPermissionQuery> }) => Promise<IResponseData>;
	update: ({
		body,
		params,
	}: {
		body: Static<typeof updatePermissionBody>;
		params: Static<typeof permissionParam>;
	}) => Promise<IResponseData>;
}

export const permissionController: IPermissionController = {
	getList: async ({
		query: { search, entity, action, access },
	}): Promise<IResponseData> => {
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

	update: async ({ body, params: { id } }): Promise<IResponseData> => {
		const { description } = body;

		const permission = await db
			.update(permissions)
			.set({ description })
			.where(eq(permissions.id, id))
			.returning();

		if (!permission.length) {
			throw HttpError.NotFound(...Object.values(RES_KEY.PERMISSION_NOT_FOUND));
		}

		return resBuild(permission[0], RES_KEY.UPDATE_ROLE);
	},
};
