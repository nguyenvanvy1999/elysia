import { eq } from "drizzle-orm";
import { Elysia } from "elysia";
import {
	DB_ID_PREFIX,
	RES_KEY,
	ROUTES,
	SW_ROUTE_DETAIL,
	createSettingBody,
	errorRes,
	errorsDefault,
	settingRes,
	swaggerOptions,
} from "src/common";
import { HttpError, db } from "src/config";
import { settings } from "src/db";
import { isAuthenticated } from "src/middleware";
import { checkValue, getValue } from "src/service";
import { dbIdGenerator, encryptSetting, resBuild } from "src/util";

export const settingRoutes = new Elysia({
	prefix: ROUTES.SETTING_V1,
	detail: { tags: [swaggerOptions.tags.setting.name] },
})
	.use(isAuthenticated)
	.post(
		"/",
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
				.returning({
					id: settings.id,
					key: settings.key,
					value: settings.value,
					type: settings.type,
					isEncrypt: settings.isEncrypt,
					description: settings.description,
				});
			return resBuild(
				{ ...setting[0], value: getValue<Record<string, any>>(setting[0]) },
				RES_KEY.CREATE_SETTING,
			);
		},
		{
			body: createSettingBody,
			detail: SW_ROUTE_DETAIL.CREATE_SETTING,
			response: {
				200: settingRes,
				409: errorRes,
				...errorsDefault,
			},
		},
	);
