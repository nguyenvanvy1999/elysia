import { Elysia } from "elysia";
import { type IRequestDerive, ROUTES, swaggerOptions } from "src/common";

export const deviceRoutes = new Elysia<
	ROUTES.DEVICE_V1,
	false,
	{
		derive: IRequestDerive;
		decorator: Record<string, unknown>;
		store: Record<string, unknown>;
		resolve: Record<string, unknown>;
	}
>({
	prefix: ROUTES.DEVICE_V1,
	detail: { tags: [swaggerOptions.tags.auth.name] },
});
