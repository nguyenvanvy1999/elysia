import { randomUUID } from "node:crypto";
import type { SocketAddress } from "bun";
import type { Elysia } from "elysia";
import {
	AVAILABLE_LANGUAGES,
	DEFAULT_APP_LANGUAGE,
	HEADER_KEY,
	type IPHeaders,
	type IRequestOption,
	versionOptions,
} from "src/common";
import { UAParser, type UAParserInstance } from "ua-parser-js";

export const headersToCheck: IPHeaders[] = [
	"x-real-ip", // Nginx proxy/FastCGI
	"x-client-ip", // Apache https://httpd.apache.org/docs/2.4/mod/mod_remoteip.html#page-header
	"cf-connecting-ip", // Cloudflare
	"fastly-client-ip", // Fastly
	"x-cluster-client-ip", // GCP
	"x-forwarded", // General Forwarded
	"forwarded-for", // RFC 7239
	"forwarded", // RFC 7239
	"x-forwarded", // RFC 7239
	"appengine-user-ip", // GCP
	"true-client-ip", // Akamai and Cloudflare
	"cf-pseudo-ipv4", // Cloudflare
];

export const getIP = (
	headers: Headers,
	checkHeaders: IPHeaders[] | string = headersToCheck,
): string | null | undefined => {
	if (typeof checkHeaders === "string" && headers.get(checkHeaders))
		return headers.get(checkHeaders);
	// X-Forwarded-For is the de-facto standard header
	if (headers.get("x-forwarded-for"))
		return headers.get("x-forwarded-for")?.split(",")[0];
	let clientIP: string | undefined | null = null;
	if (!checkHeaders) return null;
	for (const header of checkHeaders) {
		clientIP = headers.get(header);
		if (clientIP) break;
	}
	return clientIP;
};

export const requestHeader =
	({
		noCache = false,
		id = false,
		idHeader = HEADER_KEY.X_REQUEST_ID,
		idUUID = randomUUID,
		timezone = false,
		timezoneHeader = HEADER_KEY.X_TIMEZONE,
		timestamp = false,
		timestampHeader = HEADER_KEY.X_TIMESTAMP,
		userAgent = false,
		userAgentHeader = HEADER_KEY.USER_AGENT,
		version = false,
		versionHeader = HEADER_KEY.X_VERSION,
		repoVersion = false,
		repoVersionHeader = HEADER_KEY.X_REPO_VERSION,
		customLanguage = false,
		customLanguageHeader = HEADER_KEY.X_CUSTOM_LANGUAGE,
		ip = false,
		ipCheckHeaders = headersToCheck,
		ipHeadersOnly = false,
	}: Readonly<IRequestOption> = {}) =>
	(app: Elysia) => {
		return app
			.on("request", ({ set, request }): void => {
				const headers = request.headers;

				if (noCache) {
					set.headers["Surrogate-Control"] = "no-store";
					set.headers["Cache-Control"] =
						"no-store, no-cache, must-revalidate, proxy-revalidate";
					// Deprecated though https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Pragma
					set.headers.Pragma = "no-cache";
					set.headers.Expires = "0";
				}

				if (id) {
					set.headers[idHeader] = headers.get(idHeader) || idUUID();
				}

				if (timezone) {
					set.headers[timezoneHeader] =
						headers.get(timezoneHeader) ||
						Intl.DateTimeFormat().resolvedOptions().timeZone;
				}

				if (timestamp) {
					set.headers[timestampHeader] = headers.get(timestampHeader)
						? Number.parseInt(headers.get(timestampHeader), 10)
						: Date.now();
				}

				if (version) {
					set.headers[versionHeader] =
						headers.get(versionHeader) || versionOptions.version;
				}

				if (repoVersion) {
					set.headers[repoVersionHeader] =
						headers.get(repoVersionHeader) || versionOptions.version;
				}

				if (customLanguage) {
					const language = headers.get(customLanguageHeader);
					set.headers[customLanguageHeader] = Object.values(
						AVAILABLE_LANGUAGES,
					).includes(language)
						? language
						: DEFAULT_APP_LANGUAGE;
				}
			})
			.derive({ as: "global" }, ({ request, set }) => {
				const deriveResponse: any = {
					id: set.headers[idHeader],
					timezone: set.headers[timezoneHeader],
					timestamp: set.headers[timestampHeader],
					userAgent: set.headers[userAgentHeader],
					version: set.headers[versionHeader],
					repoVersion: set.headers[repoVersionHeader],
					customLanguage: set.headers[customLanguageHeader],
				};

				if (ip) {
					let clientIP: string | undefined | null | SocketAddress = null;
					if (!ipHeadersOnly && globalThis.Bun) {
						if (!app.server)
							throw new Error(
								"Elysia server is not initialized. Make sure to call Elysia.listen()",
							);
						clientIP = app.server.requestIP(request);
					}
					clientIP = getIP(request.headers, ipCheckHeaders);
					deriveResponse.ip = clientIP;
				}

				if (userAgent) {
					const parserUserAgent: UAParserInstance = new UAParser(
						request.headers.get(userAgentHeader) ?? "",
					);
					deriveResponse.userAgent = parserUserAgent.getResult();
				}
				return deriveResponse;
			});
	};
