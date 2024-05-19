import sgMail from "@sendgrid/mail";
import type MailService from "@sendgrid/mail";
import { config } from "src/config/env";

sgMail.setApiKey(config.sendgridApiKey);

export const sendgridClient: typeof MailService = sgMail;
