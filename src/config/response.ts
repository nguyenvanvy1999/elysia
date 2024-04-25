import type { Elysia } from "elysia";
import {
	AVAILABLE_LANGUAGES,
	DEFAULT_APP_LANGUAGE,
	type IResponse,
	type IResponseMetadata,
	versionOptions,
} from "src/common";

const encoder = new TextEncoder();

export const httpResponse =
	() =>
	(
		app: Elysia<
			"",
			false,
			{
				derive: {
					readonly requestID: string;
					readonly requestTimezone: string;
				};
				decorator: Record<string, unknown>;
				store: Record<string, unknown>;
				resolve: Record<string, unknown>;
			}
		>,
	) =>
		app
			.mapResponse(({ response, set, requestID, request, requestTimezone }) => {
				const isJson: boolean = typeof response === "object";
				set.headers["Content-Encoding"] = "gzip";
				if (isJson) {
					const metadata = {
						languages: Object.values(AVAILABLE_LANGUAGES),
						language: DEFAULT_APP_LANGUAGE,
						timestamp: Date.now(),
						timezone: requestTimezone,
						version: versionOptions.version,
						repoVersion: versionOptions.repoVersion,
						requestId: requestID,
						url: request.url,
						method: request.method,
					} satisfies IResponseMetadata;
					const dataRes = {
						metadata,
						message: "Success",
						code: 200,
						data: response,
					} satisfies IResponse;
					return new Response(
						Bun.gzipSync(encoder.encode(JSON.stringify(dataRes))),
						{
							headers: { "Content-Type": `"application/json"; charset=utf-8` },
						},
					);
				}
				return new Response(
					Bun.gzipSync(encoder.encode(response?.toString() ?? "")),
					{ headers: { "Content-Type": `"text/plain"; charset=utf-8` } },
				);
			})
			.onResponse(() => {
				console.log("Response", performance.now());
			});
