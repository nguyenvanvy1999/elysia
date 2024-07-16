import { and, asc, eq, ilike, or } from "drizzle-orm";
import type { Static } from "elysia";
import {
	type IResponseData,
	type IResponsePagingData,
	RES_KEY,
	type listPermissionQuery,
	type permissionParam,
	type updatePermissionBody,
} from "src/common";
import { HttpError, db } from "src/config";
import { permissions } from "src/db";
import {
	customCount,
	getCount,
	getLimit,
	getOffset,
	resBuild,
	resPagingBuild,
} from "src/util";

interface IPermissionController {
	getList: ({
		query,
	}: {
		query: Static<typeof listPermissionQuery>;
	}) => Promise<IResponsePagingData>;
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
		query: { search, entity, action, access, limit, offset },
	}): Promise<IResponsePagingData> => {
		limit = getLimit(limit);
		offset = getOffset(offset);
		const filter = and(
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
		);
		const [data, count] = await Promise.all([
			db
				.select()
				.from(permissions)
				.where(filter)
				.orderBy(
					asc(permissions.entity),
					asc(permissions.action),
					asc(permissions.access),
				)
				.limit(limit)
				.offset(offset),
			db.select({ count: customCount() }).from(permissions).where(filter),
		]);

		return resPagingBuild(data, RES_KEY.LIST_PERMISSION, {
			count: getCount(count),
			offset,
			limit,
		});
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
