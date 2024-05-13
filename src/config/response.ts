import type { Elysia } from "elysia";
import {
	AVAILABLE_LANGUAGES,
	type IRequestDerive,
	type IResponse,
	type IResponseData,
	type IResponseMetadata,
} from "src/common";
import { config } from "src/config/config";
import { translate } from "src/util/translate";

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
		app.onAfterHandle(
			async ({
				response,
				set,
				request,
				id,
				timezone,
				timestamp,
				repoVersion,
				version,
				customLanguage,
				path,
			}): Promise<Response | undefined> => {
				const ignorePaths: string[] = [config.swaggerUiPath];
				if (ignorePaths.some((a) => path.includes(a.replaceAll("/", "")))) {
					return;
				}
				const isJson: boolean = typeof response === "object";
				set.headers["Content-Encoding"] = "gzip";
				if (isJson) {
					const newResponse: IResponseData = response as IResponseData;
					const metadata = {
						languages: AVAILABLE_LANGUAGES,
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
						message: await translate(newResponse.message, customLanguage),
						code: newResponse.code,
						data: newResponse.data,
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
			},
		);
