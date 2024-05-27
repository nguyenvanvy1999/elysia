import handlebars from "handlebars";
import type { ISendEmail } from "src/common";
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

export const sendEmail = async <T extends ISendEmail>(
	{ email, data, emailType }: T,
	subject: string,
): Promise<void> => {
	try {
		const html = await renderEmail(`${emailType}.hbs`, data);
		const messageInfo = {
			to: email,
			from: config.sendgridMailFrom,
			subject,
			html,
		};
		await sendgridClient.send(messageInfo);
	} catch (e) {
		logger.error("Error sendEmail", e);
	}
};
