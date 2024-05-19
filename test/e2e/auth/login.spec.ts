import { describe, expect, it } from "bun:test";
import { treaty } from "@elysiajs/eden";
import { Elysia } from "elysia";
import {
	DEFAULT,
	HTTP_METHOD,
	type IResponseMetadata,
	LANGUAGE,
	versionOptions,
} from "src/common";
import {
	config,
	httpError,
	httpResponse,
	logger,
	maintenance,
	requestHeader,
} from "src/config";
import { authRoutes } from "src/router";

describe("E2E test: Auth - Login test", (): void => {
	const app = new Elysia()
		.use(logger.into({ autoLogging: true }))
		.onRequest(maintenance)
		.use(
			requestHeader({
				ip: true,
				timezone: true,
				timestamp: true,
				customLanguage: true,
				id: true,
				version: true,
				repoVersion: true,
			}),
		)
		.use(httpError())
		.use(httpResponse())
		.use(authRoutes)
		.listen(config.appPort);
	const api = treaty(app);

	const expectMetadata = (metadata?: IResponseMetadata) => {
		expect(metadata).toBeObject();
		expect(metadata?.languages).toMatchObject(Object.values(LANGUAGE));
		expect(metadata?.language).toBe(DEFAULT.LANGUAGE);
		expect(metadata?.repoVersion).toBe(versionOptions.repoVersion);
		expect(metadata?.version).toBe(versionOptions.version);
	};

	describe("Case 1: testing with admin login after seed", () => {
		it("should be success when email and password correct", async (): Promise<void> => {
			const { data, error } = await api.api.v1.auth.login.post({
				email: config.adminEmail,
				password: config.adminPassword,
			});
			expect(error).toBe(null);
			expect(data).toBeObject();
			expect(data?.metadata?.method).toBe(HTTP_METHOD.POST);
			expectMetadata(data?.metadata);
		});
	});
});
