import type { Elysia } from "elysia";
import {
	AVAILABLE_LANGUAGES,
	type IRequestDerive,
	type IResponse,
	type IResponseMetadata,
} from "src/common";

const encoder = new TextEncoder();

export const httpResponse =
	() =>
	(
		app: Elysia<
			"",
			false,
			{
				derive: IRequestDerive;
				decorator: Record<string, unknown>;
				store: Record<string, unknown>;
				resolve: Record<string, unknown>;
			}
		>,
	) =>
		app.mapResponse(
			({
				response,
				set,
				request,
				id,
				timezone,
				timestamp,
				repoVersion,
				version,
				customLanguage,
			}): Response => {
				const isJson: boolean = typeof response === "object";
				set.headers["Content-Encoding"] = "gzip";
				if (isJson) {
					const metadata = {
						languages: Object.values(AVAILABLE_LANGUAGES),
						language: customLanguage,
						timestamp,
						timezone,
						version,
						repoVersion,
						requestId: id,
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
							headers: {
								"Content-Type": "application/json; charset=utf-8",
							},
						},
					);
				}
				return new Response(
					Bun.gzipSync(encoder.encode(response?.toString() ?? "")),
					{
						headers: {
							"Content-Type": "text/plain; charset=utf-8",
						},
					},
				);
			},
		);
