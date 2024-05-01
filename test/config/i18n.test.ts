import { beforeEach, describe, expect, it } from "bun:test";
import Elysia from "elysia";
import { type InitOptions, createInstance, type i18n } from "i18next";
import {
	type LanguageDetector,
	i18next,
	newLanguageDetector,
} from "src/config";

const req = (path: string, requestInit?: RequestInit) =>
	new Request(`http://localhost${path}`, requestInit);

const initOptions: InitOptions = {
	lng: "nl",
	resources: {
		nl: {
			translation: {
				greeting: "Hallo!",
			},
		},
		en: {
			translation: {
				greeting: "Hello!",
			},
		},
		fr: {
			translation: {
				greeting: "Bonjour!",
			},
		},
	},
	fallbackLng: false,
};

describe("Config: I18n testing", () => {
	let instance: i18n;

	beforeEach(() => {
		instance = createInstance(initOptions);
	});

	it("translates", async () => {
		const app = new Elysia()
			.use(i18next({ instance }))
			.get("/", ({ t }) => t("greeting"));

		const response = await app.handle(req("/"));
		expect(await response.text()).toEqual("Hallo!");
	});

	it("changes language based on query parameter", async () => {
		const app = new Elysia()
			.use(i18next({ instance }))
			.get("/", ({ t }) => t("greeting"));
		const response = await app.handle(req("/?lang=en"));
		expect(await response.text()).toEqual("Hello!");
	});

	it("changes language based on accept-language header", async () => {
		const app = new Elysia()
			.use(i18next({ instance }))
			.get("/", ({ t }) => t("greeting"));
		const response = await app.handle(
			req("/", { headers: { "accept-language": "en" } }),
		);
		expect(await response.text()).toEqual("Hello!");
	});

	it("changes language based on property in store", async () => {
		const app = new Elysia()
			.state("language", "en")
			.use(i18next({ instance }))
			.get("/", ({ t }) => t("greeting"));
		const response = await app.handle(req("/"));
		expect(await response.text()).toEqual("Hello!");
	});

	it("allows to override language detection", async () => {
		const app = new Elysia()
			.use(i18next({ instance, detectLanguage: () => "fr" }))
			.get("/", ({ t }) => t("greeting"));
		const response = await app.handle(req("/"));
		expect(await response.text()).toEqual("Bonjour!");
	});

	it("changes language based on cookie", async () => {
		const app = new Elysia()
			.onBeforeHandle(({ cookie: { lang } }) => {
				lang.value = "en";
			})
			.use(i18next({ instance }))
			.get("/", ({ t }) => t("greeting"));
		const response = await app.handle(req("/"));
		expect(await response.text()).toEqual("Hello!");
	});

	it("changes language based on path param", async () => {
		const app = new Elysia()
			.use(i18next({ instance }))
			.get("/:lang/", ({ t }) => t("greeting"));

		const response = await app.handle(req("/fr/"));
		expect(await response.text()).toEqual("Bonjour!");
	});

	it("accepts an i18next instance", async () => {
		instance = createInstance({
			...initOptions,
			lng: "fr",
		});
		const app = new Elysia()
			.use(i18next({ instance }))
			.get("/", ({ t }) => t("greeting"));
		const response = await app.handle(req("/"));
		expect(await response.text()).toEqual("Bonjour!");
	});

	it("changes language using a custom LanguageDetector created with newLanguageDetector()", async () => {
		const detector: LanguageDetector = newLanguageDetector({
			searchParamName: "x-lang",
			storeParamName: "x-lang",
			headerName: "x-lang",
			cookieName: "x-lang",
			pathParamName: "x-lang",
		});

		const app = new Elysia()
			.use(i18next({ instance, detectLanguage: detector }))
			.get("/", ({ t }) => t("greeting"));

		const response = await app.handle(req("/?x-lang=en"));
		expect(await response.text()).toEqual("Hello!");
	});
});
