import type { Elysia } from "elysia";
import {
	AVAILABLE_LANGUAGES,
	type IRequestDerive,
	type IResponse,
	type IResponseMetadata,
	type IResponsePagingData,
} from "src/common";
import { config } from "src/config/env";
import { translate } from "src/util";

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
				request,
				id,
				timezone,
				timestamp,
				repoVersion,
				version,
				customLanguage,
				path,
			}): Promise<Response | undefined> => {
				const ignorePaths: string[] = [
					config.swaggerUiPath,
					config.bullBoardPath,
				];
				if (ignorePaths.some((a) => path.includes(a.replaceAll("/", "")))) {
					return;
				}
				const isJson: boolean = typeof response === "object";
				if (isJson) {
					const newResponse: IResponsePagingData =
						response as IResponsePagingData;
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
						pagination: newResponse?.pagination,
						data: newResponse.data,
					} satisfies IResponse | IResponsePagingData;
					return new Response(JSON.stringify(dataRes), {
						headers: {
							"Content-Type": "application/json; charset=utf-8",
						},
					});
				}
				return new Response(response?.toString() ?? "", {
					headers: {
						"Content-Type": `"text/plain"; charset=utf-8`,
					},
				});
			},
		);
