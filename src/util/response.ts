export const resBuild = (data: unknown, metadata: Record<string, string>) => {
	return { data, ...metadata };
};
