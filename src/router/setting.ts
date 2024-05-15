import { asc, eq, ilike } from "drizzle-orm";
import { Elysia } from "elysia";
import {
	DB_ID_PREFIX,
	DEFAULT,
	POLICY_ACCESS,
	POLICY_ACTION,
	POLICY_ENTITY,
	RES_KEY,
	ROUTES,
	SETTING_KEY,
	SETTING_ROUTES,
	SW_ROUTE_DETAIL,
	createSettingBody,
	errorRes,
	errorsDefault,
	listSettingQuery,
	listSettingRes,
	settingParam,
	settingRes,
	swaggerOptions,
} from "src/common";
import { HttpError, db } from "src/config";
import { settings } from "src/db";
import { hasPermissions, isAuthenticated } from "src/middleware";
import { checkValue, getValue } from "src/service";
import {
	customCount,
	dbIdGenerator,
	encryptSetting,
	getCount,
	getLimit,
	getOffset,
	resBuild,
	resPagingBuild,
} from "src/util";

export const settingRoutes = new Elysia({
	prefix: ROUTES.SETTING_V1,
	detail: { tags: [swaggerOptions.tags.setting.name] },
})
	.use(isAuthenticated)
	.post(
		SETTING_ROUTES.CREATE,
		async ({ body }): Promise<any> => {
			const { key, value, type, isEncrypt, description } = body;
			const exist = await db.query.settings.findFirst({
				where: eq(settings.key, key.toLowerCase()),
				columns: { id: true },
			});
			if (exist) {
				throw HttpError.Conflict(
					RES_KEY.SETTING_ALREADY_EXIST.message,
					RES_KEY.SETTING_ALREADY_EXIST.code,
					undefined,
					{ key },
				);
			}
			const strValue: string =
				typeof value === "object" ? JSON.stringify(value) : value.toString();
			const check: boolean = checkValue(strValue, type);
			if (!check) {
				throw HttpError.BadRequest(
					...Object.values(RES_KEY.SETTING_VALUE_NOT_ALLOWED_ERROR),
				);
			}
			const setting = await db
				.insert(settings)
				.values({
					id: dbIdGenerator(DB_ID_PREFIX.SETTING),
					key: key.toLowerCase(),
					value: isEncrypt ? encryptSetting(strValue) : strValue,
					type,
					isEncrypt,
					description,
				})
				.returning()
				.then((res) => res[0]);
			return resBuild(
				{ ...setting, value: getValue(setting) },
				RES_KEY.CREATE_SETTING,
			);
		},
		{
			beforeHandle: hasPermissions([
				{
					entity: POLICY_ENTITY.SETTING,
					access: POLICY_ACCESS.ANY,
					action: POLICY_ACTION.CREATE,
				},
			]),
			body: createSettingBody,
			detail: SW_ROUTE_DETAIL.CREATE_SETTING,
			response: {
				200: settingRes,
				409: errorRes,
				...errorsDefault,
			},
		},
	)
	.get(
		SETTING_ROUTES.LIST,
		async ({ query: { limit, offset, search } }): Promise<any> => {
			const [data, count] = await Promise.all([
				db
					.select()
					.from(settings)
					.where(
						search?.length ? ilike(settings.key, `%${search}%`) : undefined,
					)
					.orderBy(asc(settings.id))
					.limit(getLimit(limit))
					.offset(getOffset(offset)),
				db
					.select({ count: customCount() })
					.from(settings)
					.where(
						search?.length ? ilike(settings.key, `%${search}%`) : undefined,
					),
			]);

			return resPagingBuild(
				data.map((x) => ({ ...x, value: getValue(x) })),
				RES_KEY.LIST_SETTING,
				{
					count: getCount(count),
					offset: offset ?? DEFAULT.PAGING_OFFSET,
					limit: limit ?? DEFAULT.PAGING_LIMIT,
				},
			);
		},
		{
			beforeHandle: hasPermissions([
				{
					entity: POLICY_ENTITY.SETTING,
					access: POLICY_ACCESS.ANY,
					action: POLICY_ACTION.READ,
				},
			]),
			detail: SW_ROUTE_DETAIL.LIST_SETTING,
			query: listSettingQuery,
			response: {
				200: listSettingRes,
				...errorsDefault,
			},
		},
	)
	.get(
		SETTING_ROUTES.GET,
		async ({ params: { id } }): Promise<any> => {
			const setting = await db.query.settings.findFirst({
				where: eq(settings.id, id),
			});
			if (!setting) {
				throw HttpError.NotFound(...Object.values(RES_KEY.SETTING_NOT_FOUND));
			}
			return resBuild(
				{ ...setting, value: getValue(setting) },
				RES_KEY.GET_SETTING,
			);
		},
		{
			beforeHandle: hasPermissions([
				{
					entity: POLICY_ENTITY.SETTING,
					access: POLICY_ACCESS.ANY,
					action: POLICY_ACTION.READ,
				},
			]),
			params: settingParam,
			detail: SW_ROUTE_DETAIL.GET_SETTING,
			response: {
				200: settingRes,
				404: errorRes,
				...errorsDefault,
			},
		},
	)
	.delete(
		SETTING_ROUTES.DELETE,
		async ({ params: { id } }): Promise<any> => {
			const setting = await db.query.settings.findFirst({
				where: eq(settings.id, id),
				columns: { key: true, id: true },
			});
			if (!setting) {
				throw HttpError.NotFound(...Object.values(RES_KEY.SETTING_NOT_FOUND));
			}
			if (Object.values<string>(SETTING_KEY).includes(setting.key)) {
				throw HttpError.BadRequest(
					...Object.values(RES_KEY.CAN_NOT_DELETE_THIS_SETTING),
				);
			}
			await db.delete(settings).where(eq(settings.id, id));
			return resBuild({ id: setting.id }, RES_KEY.DELETE_SETTING);
		},
		{
			beforeHandle: hasPermissions([
				{
					entity: POLICY_ENTITY.SETTING,
					access: POLICY_ACCESS.ANY,
					action: POLICY_ACTION.DELETE,
				},
			]),
			params: settingParam,
			detail: SW_ROUTE_DETAIL.DELETE_SETTING,
			response: {
				200: settingRes,
				404: errorRes,
				...errorsDefault,
			},
		},
	);
