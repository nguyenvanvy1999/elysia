import { logger } from "@bogeychan/elysia-logger";
import { cors } from "@elysiajs/cors";
import { serverTiming } from "@elysiajs/server-timing";
import { staticPlugin } from "@elysiajs/static";
import { swagger } from "@elysiajs/swagger";
import { Elysia } from "elysia";

const app = new Elysia()
	.use(serverTiming())
	.use(cors())
	.use(swagger())
	.use(staticPlugin())
	.use(logger({ level: "error" }))
	.get("/", () => "Hello Elysia")
	.listen(3000);

console.log(
	`🦊 Elysia is running at ${app.server?.hostname}:${app.server?.port}`,
);
