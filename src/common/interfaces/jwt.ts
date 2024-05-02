export interface IJwtVerifyOptions {
	audience: string;
	issuer: string;
	subject: string;
	secretKey: string;
	notBefore?: number | string;
	expiresIn?: string | number;
}
