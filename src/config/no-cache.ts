import type { Elysia } from "elysia";

export const nocache = (app: Elysia) => {
	return app.onRequest(({ set }) => {
		set.headers["Surrogate-Control"] = "no-store";
		set.headers["Cache-Control"] =
			"no-store, no-cache, must-revalidate, proxy-revalidate";
		// Deprecated though https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Pragma
		set.headers.Pragma = "no-cache";
		set.headers.Expires = "0";
	});
};
