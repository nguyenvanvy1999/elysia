import { config } from "src/config/env";
import twilio, { type Twilio } from "twilio";

export const twilioClient: Twilio = twilio(
	config.twilioAccountSid,
	config.twilioAuthToken,
);
