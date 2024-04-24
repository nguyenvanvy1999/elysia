export interface IResponseMetadata {
	languages: string[];
	timestamp: number;
	timezone: string;
	requestId: string;
	url: string;
	method: string;
	version: string;
	repoVersion: string;
	[key: string]: unknown;
}
