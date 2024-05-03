export interface IAuthPassword {
	password: string;
	passwordExpired: Date;
	passwordCreated: Date;
	passwordAttempt: number;
}
