import { swagger } from "@elysiajs/swagger";
import { Elysia } from "elysia";
import { AuthService } from "src/service";

export const authRoutes = new Elysia({
	prefix: "/v1/auth",
	detail: { tags: ["Auth"] },
})
	.decorate({
		authService: new AuthService(),
	})
	.use(swagger())
	.post("/register", ({ authService }) => {
		return authService.register();
	});
