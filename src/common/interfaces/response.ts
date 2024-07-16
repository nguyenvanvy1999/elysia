export interface IResponseMetadata {
	languages: string[];
	timestamp: number;
	timezone?: string;
	requestId?: string;
	url: string;
	method: string;
	version?: string;
	repoVersion?: string;
	[key: string]: unknown;
}

export interface IResponse {
	metadata: IResponseMetadata;
	code: string;
	message: string;
	data?: unknown;
}

export interface IResponseData {
	data: any;
	code: string;
	message: string;
}

export interface IResponsePagingData extends IResponseData {
	pagination: {
		totalItems: number;
		currentPageCount: number;
		totalPages: number;
		currentPage: number;
	};
}
