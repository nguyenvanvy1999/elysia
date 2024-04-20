import chalk from "chalk";
import type { Context } from "elysia";

function requestLogger(ctx: Context): void {
	if (process.env.NODE_ENV === "development") {
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

function bootLogger() {
	if (process.env.NODE_ENV === "development") {
		console.log(
			"running on",
			chalk.blueBright("http://localhost:") +
				chalk.greenBright(process.env.PORT),
		);
	}
}
