import * as path from "node:path";
import type { BunFile } from "bun";
import { z } from "zod";

const configVariables = z.object({
	version: z.string(),
	repoVersion: z.string(),
	swagger: z.object({
		enable: z.boolean().default(true),
		authEnable: z.boolean().default(true),
		path: z.string().default("/swagger"),
		info: z.object({
			title: z.string(),
			description: z.string(),
			contact: z.object({
				name: z.string(),
				url: z.string().url(),
				email: z.string().email(),
			}),
			license: z.object({
				name: z.string(),
				url: z.string().url(),
			}),
			termsOfService: z.string(),
		}),
	}),
});

const configFile: BunFile = Bun.file(
	path.join(import.meta.dirname, "../../", "config.json"),
);
const pkg = await configFile.json();
export const config = configVariables.parse(pkg);
