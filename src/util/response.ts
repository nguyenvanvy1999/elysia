import {
	DEFAULT,
	type IResponseData,
	type IResponsePagingData,
} from "src/common";

export const resBuild = (
	data: unknown,
	metadata: Record<"code" | "message", string>,
): IResponseData => {
	return { data, ...metadata } satisfies IResponseData;
};

export const resPagingBuild = (
	data: Array<unknown>,
	metadata: Record<"code" | "message", string>,
	paging: { limit: number; offset: number; count: number } = {
		limit: DEFAULT.PAGING_LIMIT,
		offset: DEFAULT.PAGING_OFFSET,
		count: 0,
	},
) => {
	const { count, limit, offset } = paging;
	return {
		data,
		pagination: {
			currentPageCount: data.length,
			totalItems: count,
			totalPages:
				count === 0 ? 0 : count < limit ? 1 : Math.ceil(count / limit),
			currentPage: Math.ceil(offset / limit),
		},
		...metadata,
	} satisfies IResponsePagingData;
};
