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

export const sendEmailNewDeviceLogin = async (url: string): Promise<void> => {
	try {
		const html = await renderEmail("login-new-device.hbs", { url });
		const messageInfo = {
			to: "nguyenvanvy1999@gmail.com",
			from: config.sendgridMailFrom,
			subject: "Verify your account",
			html,
		};
		const response = await sendgridClient.send(messageInfo);
		console.log(response);
	} catch (e) {
		console.log(e);
		logger.error(e);
	}
};
