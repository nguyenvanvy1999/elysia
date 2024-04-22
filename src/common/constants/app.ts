export const versionOptions = {
	repoVersion: "1.0.50",
	version: "1.0.50",
};

export const swaggerOptions = {
	enable: true,
	authEnable: true,
	path: "/swagger",
	info: {
		title: "Elysia Documentation",
		description: "Development documentation",
		contact: {
			name: "Nguyen Van Vy",
			url: "https://www.facebook.com/vy.nguyenvan.79656",
			email: "nguyenvanvy1999@gmail.com",
		},
		license: { name: "MIT", url: "https://opensource.org/license/mit" },
		termsOfService: "termsOfService",
	},
	tags: {
		auth: { name: "Auth", description: "Authentication endpoints" },
		app: { name: "App", description: "General endpoints" },
	},
};

export const passwordOptions = {
	PASSWORD_EXPIRED: "182d",
};
