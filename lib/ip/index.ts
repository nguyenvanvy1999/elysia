import type { Elysia } from "elysia";

export type IPHeaders =
	| "x-real-ip"
	| "x-client-ip"
	| "cf-connecting-ip"
	| "fastly-client-ip"
	| "x-cluster-client-ip"
	| "forwarded-for"
	| "forwarded"
	| "x-forwarded"
	| "appengine-user-ip"
	| "true-client-ip"
	| "cf-pseudo-ipv4"
	| (string & {});

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

export const ip =
	(
		config: {
			/**
			 * Customize headers to check for IP address
			 * @default ['x-real-ip', 'x-client-ip', 'cf-connecting-ip', 'fastly-client-ip', 'x-cluster-client-ip', 'x-forwarded', 'forwarded-for', 'forwarded', 'x-forwarded', 'appengine-user-ip', 'true-client-ip', 'cf-pseudo-ipv4']
			 */
			checkHeaders?: IPHeaders[] | string;
			/**
			 * Only check headers regardless of the runtime environment
			 * @default false
			 */
			headersOnly?: boolean;
		} = {
			headersOnly: false,
		},
	) =>
	(app: Elysia) => {
		return app.derive({ as: "global" }, ({ request }) => {
			if (!config.headersOnly && globalThis.Bun) {
				if (!app.server)
					throw new Error(
						"Elysia server is not initialized. Make sure to call Elysia.listen()",
					);
				return {
					ip: app.server.requestIP(request),
				};
			}
			const clientIP: string | null | undefined = getIP(
				request.headers,
				config.checkHeaders,
			);
			return {
				ip: clientIP,
			};
		});
	};
