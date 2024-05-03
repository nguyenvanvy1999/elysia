import type { JwtPayload } from "jsonwebtoken";
import type { Entity } from "redis-om";

export interface IJwtVerifyOptions {
	audience?: string;
	issuer?: string;
	subject?: string;
	secretKey: string;
	notBefore?: number | string;
	expiresIn?: string | number;
}

export interface IJwtPayload extends JwtPayload {
	loginDate: Date;
	sessionId: string;
}

export type ISession = Entity & {
	id: string;
	userId: string;
};
