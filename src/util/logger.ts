import chalk from "chalk";
import type { Context } from "elysia";
import { APP_ENV } from "src/common";
import { env } from "src/config";

export function requestLogger(ctx: Context): void {
	if (env.appEnv === APP_ENV.DEVELOPMENT) return;
	{
		let coloredMethod: string;
		switch (ctx.request.method) {
			case "GET":
				coloredMethod = chalk.green(ctx.request.method);
				break;
			case "DELETE":
				coloredMethod = chalk.red(ctx.request.method);
				break;
			default:
				coloredMethod = chalk.yellowBright(ctx.request.method);
				break;
		}
		console.info(
			coloredMethod,
			chalk.yellow("--"),
			ctx.request.url.replace(`http://localhost:${process.env.PORT}`, ""),
			chalk.yellow("--"),
			ctx.code
				? chalk.bgRedBright(ctx.code)
				: ctx.set.status === 200
					? chalk.bgGreen(ctx.set.status)
					: ctx.set.status === 300
						? chalk.bgYellowBright(chalk.black(ctx.set.status))
						: chalk.bgRedBright(chalk.black(ctx.set.status)),
			new Date(),
		);
	}
}

export function bootLogger(): void {
	if (env.appEnv === APP_ENV.DEVELOPMENT) {
		console.log(
			"🦊 Elysia is running at",
			chalk.blueBright("http://localhost:") +
				chalk.greenBright(process.env.PORT),
		);
	}
}
