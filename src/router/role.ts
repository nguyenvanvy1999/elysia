import { Elysia } from "elysia";
import { type IRequestDerive, ROUTES, swaggerOptions } from "src/common";
import { isAuthenticated } from "src/middleware";

export const roleRoutes = new Elysia<
	ROUTES.ROLE_V1,
	false,
	{
		derive: IRequestDerive;
		decorator: Record<string, unknown>;
		store: Record<string, unknown>;
		resolve: Record<string, unknown>;
	}
>({
	prefix: ROUTES.ROLE_V1,
	detail: { tags: [swaggerOptions.tags.role.name] },
}).use(isAuthenticated);
