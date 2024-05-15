import { DEFAULT, PAGING_MAX_LIMIT } from "src/common";

export const getOffset = (offset: number | undefined): number => {
	return offset ?? DEFAULT.PAGING_OFFSET;
};

export const getLimit = (limit: number | undefined): number => {
	const lm: number = limit ?? DEFAULT.PAGING_LIMIT;
	return lm > PAGING_MAX_LIMIT ? PAGING_MAX_LIMIT : lm;
};
