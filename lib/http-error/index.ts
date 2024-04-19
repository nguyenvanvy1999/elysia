import { Elysia } from "elysia";

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

interface HttpErrorConstructor {
	customFormatter?: (error: HttpError) => unknown;
	returnStringOnly?: boolean;
}

export const httpError =
	(
		params: HttpErrorConstructor = {
			customFormatter: undefined,
			returnStringOnly: false,
		},
	) =>
	(app: Elysia) =>
		app
			.error({ ELYSIA_HTTP_ERROR: HttpError })
			.onError(({ code, error, set }) => {
				if (code === "ELYSIA_HTTP_ERROR") {
					set.status = error.statusCode;
					if (params.customFormatter) {
						return params.customFormatter(error);
					}
					if (params.returnStringOnly) {
						return error.message;
					}
					return {
						error: true,
						code: error.statusCode,
						message: error.message,
						data: error.errorData,
					};
				}
			});
