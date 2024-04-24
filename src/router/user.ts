import { Elysia } from "elysia";
import { swaggerOptions } from "src/common";
import { httpErrorDecorator } from "src/config";

export const userRoutes = new Elysia({
	prefix: "/v1/user",
	detail: { tags: [swaggerOptions.tags.user.name] },
}).use(httpErrorDecorator);
