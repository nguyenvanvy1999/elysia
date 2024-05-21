import type { EMAIL_TYPE } from "src/common/constants";

export interface ISendEmailJob {
	email: string;
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
	};
}

export interface IEmailLoginNewDevice extends ISendEmailJob {
	emailType: EMAIL_TYPE.LOGIN_NEW_DEVICE;
	data: {
		url: string;
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
