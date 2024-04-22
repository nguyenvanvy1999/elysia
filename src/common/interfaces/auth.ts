export interface IAuthPassword {
	salt: string;
	passwordHash: string;
	passwordExpired: Date;
	passwordCreated: Date;
	passwordAttempt: number;
}
