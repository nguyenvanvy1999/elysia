export type IPHeaders =
	| "x-real-ip"
	| "x-client-ip"
	| "cf-connecting-ip"
	| "fastly-client-ip"
	| "x-cluster-client-ip"
	| "forwarded-for"
	| "forwarded"
	| "x-forwarded"
	| "appengine-user-ip"
	| "true-client-ip"
	| "cf-pseudo-ipv4"
	| (string & {});

export interface IRequestOption {
	noCache?: boolean;
	timezone?: boolean;
	timezoneHeader?: string;
	id?: boolean;
	idUUID?: () => string;
	idHeader?: string;
	timestamp?: boolean;
	timestampHeader?: string;
	userAgent?: boolean;
	userAgentHeader?: string;
	version?: boolean;
	versionHeader?: string;
	repoVersion?: boolean;
	repoVersionHeader?: string;
	customLanguage?: boolean;
	customLanguageHeader?: string;
	ip?: boolean;
	ipCheckHeaders?: IPHeaders[] | string;
	ipHeadersOnly?: boolean;
}

export interface IRequestDerive extends Record<string, unknown> {
	id: string;
	timezone: string;
	timestamp: number;
	userAgent: unknown;
	version: string;
	repoVersion: string;
	customLanguage: string;
	ip: unknown;
}
