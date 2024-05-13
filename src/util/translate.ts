import { and, eq } from "drizzle-orm";
import { DEFAULT, REDIS_CACHE_EX, TRANSLATION_NS } from "src/common";
import { db, redisClient } from "src/config";
import { translations } from "src/db";

export const translate = async (
	key: string,
	lang: string = DEFAULT.LANGUAGE,
	ns: string = DEFAULT.TRANSLATION_NS,
	params: Record<string, string> = {},
): Promise<string> => {
	let result: string = key;
	const existInCache: string | null = await redisClient.get(
		translateCacheKey(key, lang, ns),
	);
	if (!existInCache) {
		const data = await db.query.translations.findFirst({
			where: and(
				eq(translations.lang, lang),
				eq(translations.ns, ns),
				eq(translations.key, key),
			),
		});
		if (data) {
			result = data.value;
			await redisClient.set(translateCacheKey(key, lang, ns), data.value, {
				EX: REDIS_CACHE_EX.TRANSLATION_CACHE,
			});
		}
	} else {
		result = existInCache;
	}
	return replaceParams(result, params);
};

const translateCacheKey = (
	key: string,
	lang: string,
	ns: string = TRANSLATION_NS.BACKEND,
): string => {
	return `${lang}_${ns}_${key}`;
};

const replaceParams = (
	text: string,
	params: Record<string, string> = {},
): string => {
	let rs: string = text;
	for (const key of Object.keys(params)) {
		rs = rs.replace(new RegExp(`{{\\s*${key}\\s*}}`, "g"), params[key]);
	}
	return rs;
};
