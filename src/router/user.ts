import { Elysia } from "elysia";
import {
	RES_KEY,
	ROUTES,
	SW_ROUTE_DETAIL,
	USER_ROUTES,
	errorRes,
	errorsDefault,
	swaggerOptions,
	userInfoRes,
} from "src/common";
import { httpErrorDecorator } from "src/config";
import { isAuthenticated } from "src/middleware";
import { resBuild } from "src/util";

export const userRoutes = new Elysia({
	prefix: ROUTES.USER_V1,
	detail: { tags: [swaggerOptions.tags.user.name] },
})
	.use(httpErrorDecorator)
	.use(isAuthenticated)
	.get(
		USER_ROUTES.INFO,
		async ({ user }): Promise<any> => {
			return resBuild(
				{
					id: user.id,
					email: user.email,
					username: user.username,
					avatarUrl: user.avatarUrl,
					name: user.name,
					status: user.status,
				},
				RES_KEY.USER_INFO,
			);
		},
		{
			detail: SW_ROUTE_DETAIL.USER_INFO,
			response: {
				200: userInfoRes,
				401: errorRes,
				...errorsDefault,
			},
		},
	);
