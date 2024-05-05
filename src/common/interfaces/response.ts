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
	data: unknown;
	code: string;
	message: string;
}
