import type { EMAIL_TYPE } from "src/common/constants";

export interface ISendEmailJob {
	email: string;
}

export interface ISendEmail extends ISendEmailJob {
	emailType: EMAIL_TYPE;
	data: Record<string, any>;
}

export interface IEmailActiveAccount extends ISendEmailJob {
	emailType: EMAIL_TYPE.VERIFY_ACCOUNT;
	data: {
		url: string;
	};
}

export interface IEmailWelcome extends ISendEmailJob {
	emailType: EMAIL_TYPE.WELCOME;
	data: {
		name: string;
		url: string;
	};
}

export interface IEmailLoginNewDevice extends ISendEmailJob {
	emailType: EMAIL_TYPE.LOGIN_NEW_DEVICE;
	data: {
		ipAddress?: string;
		deviceType?: string;
		deviceVendor?: string;
		deviceModel?: string;
		os?: string;
		osVersion?: string;
		browserName?: string;
		browserVersion?: string;
	};
}

export interface IEmailWarningPasswordAttempt extends ISendEmailJob {
	emailType: EMAIL_TYPE.WARNING_PASSWORD_ATTEMPT;
}
