import { Elysia } from "elysia";
import {
	POLICY_ACCESS,
	POLICY_ACTION,
	POLICY_ENTITY,
	ROUTES,
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
	updateSettingBody,
} from "src/common";
import { settingController } from "src/controller";
import { hasPermissions, isAuthenticated } from "src/middleware";

export const settingRoutes = new Elysia({
	prefix: ROUTES.SETTING_V1,
	detail: { tags: [swaggerOptions.tags.setting.name] },
})
	.use(isAuthenticated)
	.post(SETTING_ROUTES.CREATE, settingController.create, {
		beforeHandle: hasPermissions([
			{
				entity: POLICY_ENTITY.SETTING,
				access: POLICY_ACCESS.ANY,
				action: POLICY_ACTION.CREATE,
			},
		]),
		body: createSettingBody,
		detail: {
			...SW_ROUTE_DETAIL.CREATE_SETTING,
			security: [{ accessToken: [] }],
		},
		response: {
			200: settingRes,
			409: errorRes,
			401: errorRes,
			403: errorRes,
			...errorsDefault,
		},
	})
	.get(SETTING_ROUTES.LIST, settingController.getList, {
		beforeHandle: hasPermissions([
			{
				entity: POLICY_ENTITY.SETTING,
				access: POLICY_ACCESS.ANY,
				action: POLICY_ACTION.READ,
			},
		]),
		detail: {
			...SW_ROUTE_DETAIL.LIST_SETTING,
			security: [{ accessToken: [] }],
		},
		query: listSettingQuery,
		response: {
			200: listSettingRes,
			401: errorRes,
			403: errorRes,
			...errorsDefault,
		},
	})
	.get(SETTING_ROUTES.GET, settingController.getDetail, {
		beforeHandle: hasPermissions([
			{
				entity: POLICY_ENTITY.SETTING,
				access: POLICY_ACCESS.ANY,
				action: POLICY_ACTION.READ,
			},
		]),
		params: settingParam,
		detail: {
			...SW_ROUTE_DETAIL.GET_SETTING,
			security: [{ accessToken: [] }],
		},
		response: {
			200: settingRes,
			404: errorRes,
			401: errorRes,
			403: errorRes,
			...errorsDefault,
		},
	})
	.delete(SETTING_ROUTES.DELETE, settingController.delete, {
		beforeHandle: hasPermissions([
			{
				entity: POLICY_ENTITY.SETTING,
				access: POLICY_ACCESS.ANY,
				action: POLICY_ACTION.DELETE,
			},
		]),
		params: settingParam,
		detail: {
			...SW_ROUTE_DETAIL.DELETE_SETTING,
			security: [{ accessToken: [] }],
		},
		response: {
			200: settingRes,
			404: errorRes,
			401: errorRes,
			403: errorRes,
			...errorsDefault,
		},
	})
	.put(SETTING_ROUTES.UPDATE, settingController.update, {
		beforeHandle: hasPermissions([
			{
				entity: POLICY_ENTITY.SETTING,
				access: POLICY_ACCESS.ANY,
				action: POLICY_ACTION.UPDATE,
			},
		]),
		params: settingParam,
		body: updateSettingBody,
		detail: {
			...SW_ROUTE_DETAIL.UPDATE_SETTING,
			security: [{ accessToken: [] }],
		},
		response: {
			200: settingRes,
			404: errorRes,
			401: errorRes,
			403: errorRes,
			...errorsDefault,
		},
	});
