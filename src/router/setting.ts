import { Elysia } from "elysia";
import {
	ROUTES,
	SW_ROUTE_DETAIL,
	errorRes,
	errorsDefault,
	sendEmailVerifyRes,
	settingDto,
	swaggerOptions,
} from "src/common";
import { isAuthenticated } from "src/middleware";

export const userRoutes = new Elysia({
	prefix: ROUTES.SETTING_V1,
	detail: { tags: [swaggerOptions.tags.setting.name] },
})
	.use(isAuthenticated)
	.post("/", async ({ body }): Promise<any> => {}, {
		body: settingDto,
		detail: SW_ROUTE_DETAIL.CREATE_SETTING,
		response: {
			200: sendEmailVerifyRes,
			401: errorRes,
			...errorsDefault,
		},
	});
