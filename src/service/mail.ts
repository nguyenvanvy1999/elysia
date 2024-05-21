import handlebars from "handlebars";
import { config, logger, sendgridClient } from "src/config";

const renderEmail = async (
	filename: string,
	data: Record<string, any> = {},
): Promise<string> => {
	const file = Bun.file(`src/view/email/${filename}`);
	const emailTemplate: string = await file.text();
	const template: HandlebarsTemplateDelegate =
		handlebars.compile(emailTemplate);
	return template(data);
};

export const sendEmailActiveAccount = async (
	email: string,
	url: string,
): Promise<void> => {
	try {
		const html = await renderEmail("active-account.hbs", { url });
		const messageInfo = {
			to: email,
			from: config.sendgridMailFrom,
			subject: "Verify your account",
			html,
		};
		await sendgridClient.send(messageInfo);
	} catch (e) {
		logger.error("Error sendEmailActiveAccount", e);
	}
};

export const sendEmailWelcome = async (
	email: string,
	name: string,
): Promise<void> => {
	try {
		const html = await renderEmail("welcome.hbs", { name });
		const messageInfo = {
			to: email,
			from: config.sendgridMailFrom,
			subject: "Welcome email",
			html,
		};
		await sendgridClient.send(messageInfo);
	} catch (e) {
		logger.error("Error sendEmailWelcome", e);
	}
};
