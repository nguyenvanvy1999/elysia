import type { IResponseData } from "src/common";

export const resBuild = (
	data: unknown,
	metadata: Record<"code" | "message", string>,
): IResponseData => {
	return { data, ...metadata } satisfies IResponseData;
};
