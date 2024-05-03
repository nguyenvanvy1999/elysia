import { Elysia } from "elysia";
import {
	RES_KEY,
	ROUTES,
	SW_ROUTE_DETAIL,
	USER_ROUTES,
	errorRes,
	errorsDefault,
	registerRes,
	swaggerOptions,
} from "src/common";
import { httpErrorDecorator } from "src/config";
import { resBuild } from "src/util";

export const userRoutes = new Elysia({
	prefix: ROUTES.USER_V1,
	detail: { tags: [swaggerOptions.tags.user.name] },
})
	.use(httpErrorDecorator)
	.get(
		USER_ROUTES.INFO,
		async ({ HttpError }): Promise<any> => {
			return resBuild({ test: 1 }, RES_KEY.REGISTER);
		},
		{
			detail: SW_ROUTE_DETAIL.USER_INFO,
			response: {
				200: registerRes,
				401: errorRes,
				...errorsDefault,
			},
		},
	);
