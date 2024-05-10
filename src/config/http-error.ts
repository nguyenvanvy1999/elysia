import type { Elysia } from "elysia";
import {
	AVAILABLE_LANGUAGES,
	type IRequestDerive,
	type IResponse,
	type IResponseMetadata,
	RES_KEY,
} from "src/common";
import { logger } from "src/config/logger";
import { translate } from "src/util/translate";

export class HttpError extends Error {
	public constructor(
		public message: string,
		public statusCode: number,
		public traceCode: string,
		public errorData: unknown = undefined,
	) {
		super(message);
	}

	public static BadRequest(
		message?: string,
		traceCode?: string,
		errorData?: unknown,
	): HttpError {
		return new HttpError(
			message || "Bad Request",
			400,
			traceCode ?? RES_KEY.UNKNOWN.code,
			errorData,
		);
	}

	public static Unauthorized(
		message?: string,
		traceCode?: string,
		errorData?: unknown,
	): HttpError {
		return new HttpError(
			message || "Unauthorized",
			401,
			traceCode ?? RES_KEY.UNKNOWN.code,
			errorData,
		);
	}

	public static PaymentRequired(
		message?: string,
		traceCode?: string,
		errorData?: unknown,
	): HttpError {
		return new HttpError(
			message || "Payment Required",
			402,
			traceCode ?? RES_KEY.UNKNOWN.code,
			errorData,
		);
	}

	public static Forbidden(
		message?: string,
		traceCode?: string,
		errorData?: unknown,
	): HttpError {
		return new HttpError(
			message || "Forbidden",
			403,
			traceCode ?? RES_KEY.UNKNOWN.code,
			errorData,
		);
	}

	public static NotFound(
		message?: string,
		traceCode?: string,
		errorData?: unknown,
	): HttpError {
		return new HttpError(
			message || "Not Found",
			404,
			traceCode ?? RES_KEY.UNKNOWN.code,
			errorData,
		);
	}

	public static MethodNotAllowed(
		message?: string,
		traceCode?: string,
		errorData?: unknown,
	): HttpError {
		return new HttpError(
			message || "Method Not Allowed",
			405,
			traceCode ?? RES_KEY.UNKNOWN.code,
			errorData,
		);
	}

	public static Conflict(
		message?: string,
		traceCode?: string,
		errorData?: unknown,
	): HttpError {
		return new HttpError(
			message || "Conflict",
			409,
			traceCode ?? RES_KEY.UNKNOWN.code,
			errorData,
		);
	}

	public static UnsupportedMediaType(
		message?: string,
		traceCode?: string,
		errorData?: unknown,
	): HttpError {
		return new HttpError(
			message || "UnsupportedMediaType",
			415,
			traceCode ?? RES_KEY.UNKNOWN.code,
			errorData,
		);
	}

	public static IAmATeapot(
		message?: string,
		traceCode?: string,
		errorData?: unknown,
	): HttpError {
		return new HttpError(
			message || "IAmATeapot",
			418,
			traceCode ?? RES_KEY.UNKNOWN.code,
			errorData,
		);
	}

	public static TooManyRequests(
		message?: string,
		traceCode?: string,
		errorData?: unknown,
	): HttpError {
		return new HttpError(
			message || "Too Many Requests",
			429,
			traceCode ?? RES_KEY.UNKNOWN.code,
			errorData,
		);
	}

	public static Internal(
		message?: string,
		traceCode?: string,
		errorData?: unknown,
	): HttpError {
		return new HttpError(
			message || "Internal Server Error",
			500,
			traceCode ?? RES_KEY.UNKNOWN.code,
			errorData,
		);
	}

	public static NotImplemented(
		message?: string,
		traceCode?: string,
		errorData?: unknown,
	): HttpError {
		return new HttpError(
			message || "Not Implemented",
			501,
			traceCode ?? RES_KEY.UNKNOWN.code,
			errorData,
		);
	}

	public static BadGateway(
		message?: string,
		traceCode?: string,
		errorData?: unknown,
	): HttpError {
		return new HttpError(
			message || "Bad Gateway",
			502,
			traceCode ?? RES_KEY.UNKNOWN.code,
			errorData,
		);
	}

	public static ServiceUnavailable(
		message?: string,
		traceCode?: string,
		errorData?: unknown,
	): HttpError {
		return new HttpError(
			message || "Service Unavailable",
			503,
			traceCode ?? RES_KEY.UNKNOWN.code,
			errorData,
		);
	}

	public static GatewayTimeout(
		message?: string,
		traceCode?: string,
		errorData?: unknown,
	): HttpError {
		return new HttpError(
			message || "Gateway Timeout",
			504,
			traceCode ?? RES_KEY.UNKNOWN.code,
			errorData,
		);
	}
}

export const httpError =
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
		app
			.error({ ELYSIA_HTTP_ERROR: HttpError })
			.onError(
				async ({
					code,
					error,
					set,
					request,
					id,
					timezone,
					timestamp,
					repoVersion,
					version,
					customLanguage,
				}) => {
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
					code === "VALIDATION"
						? logger.error(error, "VALIDATION")
						: logger.error(error, "ERROR");
					switch (code) {
						case "ELYSIA_HTTP_ERROR": {
							set.status = error.statusCode;
							return {
								metadata,
								code: error.traceCode,
								message: await translate(error.message, customLanguage),
								data: error.errorData,
							} satisfies IResponse;
						}
						case "VALIDATION": {
							set.status = 400;
							return {
								metadata,
								code: RES_KEY.VALIDATION.code,
								message: await translate(
									RES_KEY.VALIDATION.message,
									customLanguage,
								),
								data: error.all.map((x) => ({
									path: x.path,
									message: x.message,
									value: x.value,
								})),
							} satisfies IResponse;
						}
						case "INTERNAL_SERVER_ERROR": {
							set.status = 500;
							return {
								metadata,
								code: RES_KEY.INTERNAL_SERVER_ERROR.code,
								message: await translate(
									RES_KEY.INTERNAL_SERVER_ERROR.message,
									customLanguage,
								),
								data: null,
							};
						}
						case "INVALID_COOKIE_SIGNATURE": {
							set.status = 401;
							return {
								metadata,
								code: RES_KEY.UN_AUTHORIZATION.code,
								message: await translate(
									RES_KEY.UN_AUTHORIZATION.message,
									customLanguage,
								),
								data: null,
							};
						}
						case "PARSE": {
							set.status = 500;
							return {
								metadata,
								code: RES_KEY.INTERNAL_SERVER_ERROR.code,
								message: await translate(
									RES_KEY.INTERNAL_SERVER_ERROR.message,
									customLanguage,
								),
								data: null,
							};
						}
						case "UNKNOWN": {
							set.status = 500;
							return {
								metadata,
								code: RES_KEY.UNKNOWN.code,
								message: await translate(
									RES_KEY.UNKNOWN.message,
									customLanguage,
								),
								data: null,
							};
						}
						case "NOT_FOUND": {
							set.status = 404;
							return {
								metadata,
								code: RES_KEY.NOT_FOUND.code,
								message: await translate(
									RES_KEY.NOT_FOUND.message,
									customLanguage,
								),
								data: null,
							} satisfies IResponse;
						}
					}
				},
			);
