import { swagger } from "@elysiajs/swagger";
import { Elysia, t } from "elysia";
import { swaggerOptions } from "src/common";
import { db } from "src/db";
import { users } from "src/db/schemas";

export const authRoutes = new Elysia({
	prefix: "/v1/auth",
	detail: { tags: [swaggerOptions.tags.auth.name] },
})
	.use(swagger())
	.post("/register", async () => {}, { body: t.Object({}) });
