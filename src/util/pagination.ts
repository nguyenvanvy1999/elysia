import { DEFAULT, PAGING_MAX_LIMIT } from "src/common";

export const getOffset = (offset: number | undefined): number => {
	const ofs: number = offset ?? DEFAULT.PAGING_OFFSET;
	return ofs >= 0 ? ofs : 0;
};

export const getLimit = (limit: number | undefined): number => {
	const lm: number = limit ?? DEFAULT.PAGING_LIMIT;
	return lm > PAGING_MAX_LIMIT
		? PAGING_MAX_LIMIT
		: lm < 1
			? DEFAULT.PAGING_LIMIT
			: lm;
};
