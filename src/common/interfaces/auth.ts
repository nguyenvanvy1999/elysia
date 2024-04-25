export interface IAuthPassword {
	salt: string;
	password: string;
	passwordExpired: Date;
	passwordCreated: Date;
	passwordAttempt: number;
}
