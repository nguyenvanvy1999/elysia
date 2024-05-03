import { describe, expect, it } from "bun:test";
import { checkPasswordExpired, createPassword } from "src/util";

describe("Util: Password testing", (): void => {
	describe("createPassword", () => {
		it("Should generate hashed password and return", (): void => {
			const rootPassword: string = "test_password";
			const { password, passwordExpired, passwordAttempt } =
				createPassword(rootPassword);
			expect(passwordAttempt).toBe(0);
			expect(Bun.password.verifySync(rootPassword, password)).toBe(true);
			expect(passwordExpired > new Date()).toBe(true);
		});
	});

	describe("checkPasswordExpired", () => {
		it("Should return true if password expired", (): void => {
			const oldDate: Date = new Date(Date.now() - 1000 * 60 * 1000);
			expect(checkPasswordExpired(oldDate)).toBe(true);
		});
		it("Should return false if password not expired", (): void => {
			const oldDate: Date = new Date(Date.now() + 1000 * 60 * 1000);
			expect(checkPasswordExpired(oldDate)).toBe(false);
		});
	});
});
