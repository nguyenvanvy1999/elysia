import { asc, eq, ilike } from "drizzle-orm";
import type { Static } from "elysia";
import {
	DB_ID_PREFIX,
	RES_KEY,
	type createSettingBody,
	type listSettingQuery,
	type settingParam,
	type updateSettingBody,
} from "src/common";
import { HttpError, db, redisClient } from "src/config";
import { settings } from "src/db";
import { settingService } from "src/service";
import {
	customCount,
	encryptSetting,
	getCount,
	getLimit,
	getOffset,
	idGenerator,
	resBuild,
	resPagingBuild,
} from "src/util";

interface ISettingController {
	create: ({
		body,
	}: { body: Static<typeof createSettingBody> }) => Promise<any>;

	getList: ({
		query,
	}: { query: Static<typeof listSettingQuery> }) => Promise<any>;

	getDetail: ({
		params,
	}: { params: Static<typeof settingParam> }) => Promise<any>;

	delete: ({ params }: { params: Static<typeof settingParam> }) => Promise<any>;

	update: ({
		params,
		body,
	}: {
		params: Static<typeof settingParam>;
		body: Static<typeof updateSettingBody>;
	}) => Promise<any>;
}

export const settingController: ISettingController = {
	create: async ({ body }): Promise<any> => {
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

		const strValue: string = settingService.stringifyValue(value);
		const check: boolean = settingService.checkValue(strValue, type);
		if (!check) {
			throw HttpError.BadRequest(
				...Object.values(RES_KEY.SETTING_VALUE_NOT_ALLOWED_ERROR),
			);
		}
		const setting = await db
			.insert(settings)
			.values({
				id: idGenerator(DB_ID_PREFIX.SETTING),
				key: key.toLowerCase(),
				value: isEncrypt ? encryptSetting(strValue) : strValue,
				type,
				isEncrypt,
				description,
			})
			.returning()
			.then((res) => res[0]);
		return resBuild(
			{ ...setting, value: settingService.getValue(setting) },
			RES_KEY.CREATE_SETTING,
		);
	},

	getList: async ({ query: { limit, offset, search } }): Promise<any> => {
		limit = getLimit(limit);
		offset = getOffset(offset);
		const [data, count] = await Promise.all([
			db
				.select()
				.from(settings)
				.where(search?.length ? ilike(settings.key, `%${search}%`) : undefined)
				.orderBy(asc(settings.id))
				.limit(limit)
				.offset(offset),
			db
				.select({ count: customCount() })
				.from(settings)
				.where(search?.length ? ilike(settings.key, `%${search}%`) : undefined),
		]);

		return resPagingBuild(
			data.map((x) => ({ ...x, value: settingService.getValue(x) })),
			RES_KEY.LIST_SETTING,
			{
				count: getCount(count),
				offset,
				limit,
			},
		);
	},

	getDetail: async ({ params: { id } }): Promise<any> => {
		const setting = await db.query.settings.findFirst({
			where: eq(settings.id, id),
		});
		if (!setting) {
			throw HttpError.NotFound(...Object.values(RES_KEY.SETTING_NOT_FOUND));
		}
		return resBuild(
			{ ...setting, value: settingService.getValue(setting) },
			RES_KEY.GET_SETTING,
		);
	},

	delete: async ({ params: { id } }): Promise<any> => {
		const setting = await db.query.settings.findFirst({
			where: eq(settings.id, id),
			columns: { key: true, id: true },
		});
		if (!setting) {
			throw HttpError.NotFound(...Object.values(RES_KEY.SETTING_NOT_FOUND));
		}
		if (settingService.isProtected(setting.key)) {
			throw HttpError.BadRequest(
				...Object.values(RES_KEY.CAN_NOT_DELETE_THIS_SETTING),
			);
		}
		const result = await db
			.delete(settings)
			.where(eq(settings.id, id))
			.returning({ id: settings.id })
			.then((x) => x[0]);
		return resBuild({ id: result.id }, RES_KEY.DELETE_SETTING);
	},

	update: async ({
		params: { id },
		body: { value, description, isEncrypt, type, isSetCache },
	}): Promise<any> => {
		const strValue: string = settingService.stringifyValue(value);
		const check: boolean = settingService.checkValue(strValue, type);
		if (!check) {
			throw HttpError.BadRequest(
				...Object.values(RES_KEY.SETTING_VALUE_NOT_ALLOWED_ERROR),
			);
		}
		const setting = await db.query.settings.findFirst({
			where: eq(settings.id, id),
			columns: { type: true, id: true, key: true },
		});
		if (!setting) {
			throw HttpError.NotFound(...Object.values(RES_KEY.SETTING_NOT_FOUND));
		}
		if (setting.type !== type && settingService.isProtected(setting.key)) {
			throw HttpError.BadRequest(
				...Object.values(RES_KEY.CAN_NOT_CHANGE_TYPE_OF_THIS_SETTING),
			);
		}
		const updatedSetting = await db
			.update(settings)
			.set({
				description,
				type,
				value: isEncrypt ? encryptSetting(strValue) : strValue,
				isEncrypt,
			})
			.where(eq(settings.id, id))
			.returning();
		if (isSetCache) {
			await redisClient.set(
				setting.key,
				settingService.getValue(updatedSetting[0], true),
			);
		}
		return resBuild(
			{
				...updatedSetting[0],
				value: settingService.getValue(updatedSetting[0]),
			},
			RES_KEY.UPDATE_SETTING,
		);
	},
};
