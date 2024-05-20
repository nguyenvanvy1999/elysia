import type {
	AppControllerRoute,
	AppViewRoute,
	BullBoardQueues,
	ControllerHandlerReturnType,
	IServerAdapter,
	UIConfig,
} from "@bull-board/api/dist/typings/app";
import { html } from "@elysiajs/html";
import { staticPlugin } from "@elysiajs/static";
import ejs from "ejs";
import type Elysia from "elysia";
import type { Context } from "elysia";

export class ElysiaAdapter implements IServerAdapter {
	protected app: Elysia;
	protected basePath = "";
	protected bullBoardQueues: BullBoardQueues | undefined;
	protected errorHandler:
		| ((error: Error) => ControllerHandlerReturnType)
		| undefined;
	protected uiConfig: UIConfig = {};
	protected viewPath = "";

	constructor(app: Elysia) {
		this.app = app;
	}

	public setBasePath(path: string): ElysiaAdapter {
		this.basePath = path;
		return this;
	}

	public setStaticPath(
		staticsRoute: string,
		staticsPath: string,
	): ElysiaAdapter {
		this.app.use(
			staticPlugin({
				assets: staticsPath,
				prefix: this.basePath + staticsRoute,
			}),
		);
		this.app.use(html({ autoDoctype: "full" }));
		return this;
	}

	public setViewsPath(viewPath: string): ElysiaAdapter {
		this.viewPath = viewPath;
		return this;
	}

	public setErrorHandler(
		handler: (error: Error) => ControllerHandlerReturnType,
	) {
		this.errorHandler = handler;
		return this;
	}

	public setApiRoutes(routes: AppControllerRoute[]): ElysiaAdapter {
		for (const route of routes) {
			for (const method of Array.isArray(route.method)
				? route.method
				: [route.method]) {
				// @ts-ignore
				this.app[method](
					Array.isArray(route.route)
						? this.basePath + route.route[0]
						: this.basePath + route.route,
					async (ctx: Context) => {
						const response = await route.handler({
							queues: this.bullBoardQueues as BullBoardQueues,
							query: ctx.query,
							params: ctx.params,
						});
						ctx.set.status = response.status || 200;
						return response.body;
					},
				);
			}
		}
		return this;
	}

	public setEntryRoute(routeDef: AppViewRoute): ElysiaAdapter {
		const viewHandler = async ({ set }: { set: any }) => {
			const { name, params } = routeDef.handler({
				basePath: this.basePath,
				uiConfig: this.uiConfig,
			});

			const renderedHtml = await ejs.renderFile(
				`${this.viewPath}/${name}`,
				params,
				{ async: true },
			);
			set.status = 200;
			return renderedHtml;
		};

		const routes = Array.isArray(routeDef.route)
			? routeDef.route
			: [routeDef.route];

		for (const route of routes) {
			// @ts-ignore
			this.app[routeDef.method](this.basePath + route, viewHandler);
		}
		return this;
	}

	public setQueues(bullBoardQueues: BullBoardQueues): ElysiaAdapter {
		this.bullBoardQueues = bullBoardQueues;
		return this;
	}

	setUIConfig(config: UIConfig = {}): ElysiaAdapter {
		this.uiConfig = config;
		return this;
	}

	public getRouter(): any {
		return this.app;
	}
}
