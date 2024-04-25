import { Elysia } from "elysia";
import {
	AVAILABLE_LANGUAGES,
	type IRequestDerive,
	type IResponse,
	type IResponseMetadata,
} from "src/common";

export class HttpError extends Error {
	public constructor(
		public message: string,
		public statusCode: number,
		public errorData: unknown = undefined,
	) {
		super(message);
	}

	public static BadRequest(message?: string, errorData?: unknown) {
		return new HttpError(message || "Bad Request", 400, errorData);
	}

	public static Unauthorized(message?: string, errorData?: unknown) {
		return new HttpError(message || "Unauthorized", 401, errorData);
	}

	public static PaymentRequired(message?: string, errorData?: unknown) {
		return new HttpError(message || "Payment Required", 402, errorData);
	}

	public static Forbidden(message?: string, errorData?: unknown) {
		return new HttpError(message || "Forbidden", 403, errorData);
	}

	public static NotFound(message?: string, errorData?: unknown) {
		return new HttpError(message || "Not Found", 404, errorData);
	}

	public static MethodNotAllowed(message?: string, errorData?: unknown) {
		return new HttpError(message || "Method Not Allowed", 405, errorData);
	}

	public static Conflict(message?: string, errorData?: unknown) {
		return new HttpError(message || "Conflict", 409, errorData);
	}

	public static UnsupportedMediaType(message?: string, errorData?: unknown) {
		return new HttpError(message || "UnsupportedMediaType", 415, errorData);
	}

	public static IAmATeapot(message?: string, errorData?: unknown) {
		return new HttpError(message || "IAmATeapot", 418, errorData);
	}

	public static TooManyRequests(message?: string, errorData?: unknown) {
		return new HttpError(message || "Too Many Requests", 429, errorData);
	}

	public static Internal(message?: string, errorData?: unknown) {
		return new HttpError(message || "Internal Server Error", 500, errorData);
	}

	public static NotImplemented(message?: string, errorData?: unknown) {
		return new HttpError(message || "Not Implemented", 501, errorData);
	}

	public static BadGateway(message?: string, errorData?: unknown) {
		return new HttpError(message || "Bad Gateway", 502, errorData);
	}

	public static ServiceUnavailable(message?: string, errorData?: unknown) {
		return new HttpError(message || "Service Unavailable", 503, errorData);
	}

	public static GatewayTimeout(message?: string, errorData?: unknown) {
		return new HttpError(message || "Gateway Timeout", 504, errorData);
	}
}

export const httpErrorDecorator = new Elysia({
	name: "elysia-http-error-decorator",
}).decorate("HttpError", HttpError);

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
				({
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
					switch (code) {
						case "ELYSIA_HTTP_ERROR": {
							set.status = error.statusCode;
							return {
								metadata,
								code: error.statusCode,
								message: error.message,
								data: error.errorData,
							} satisfies IResponse;
						}
						case "VALIDATION": {
							set.status = 400;
							return {
								metadata,
								code: error.status,
								message: "Validation failed.",
								data: error.all.map((x) => ({
									path: x.path,
									message: x.message,
									value: x.value,
								})),
							} satisfies IResponse;
						}
						case "INTERNAL_SERVER_ERROR":
						case "INVALID_COOKIE_SIGNATURE":
						case "PARSE":
						case "UNKNOWN": {
							set.status = 500;
							return {
								metadata,
								code: 500,
								message: "Internal Server Error",
								data: null,
							};
						}
						case "NOT_FOUND":
							set.status = 404;
							return {
								metadata,
								code: error.status,
								message: "Not found",
								data: null,
							} satisfies IResponse;
					}
				},
			);
