import { describe, expect, it } from "bun:test";
import {
	checkPasswordExpired,
	comparePassword,
	createPassword,
} from "src/util";

describe("Util: Password testing", (): void => {
	describe("createPassword", (): void => {
		it("Should generate hashed password and return", (): void => {
			const rootPassword: string = "test_password";
			const { password, passwordExpired, passwordAttempt, passwordSalt } =
				createPassword(rootPassword);
			expect(passwordAttempt).toBe(0);
			expect(comparePassword(rootPassword, password, passwordSalt)).toBe(true);
			expect(passwordExpired > new Date()).toBe(true);
		});
	});

	describe("checkPasswordExpired", (): void => {
		it("Should return true if password expired", (): void => {
			const oldDate: Date = new Date(Date.now() - 1000 * 60 * 1000);
			expect(checkPasswordExpired(oldDate)).toBe(true);
		});
		it("Should return false if password not expired", (): void => {
			const oldDate: Date = new Date(Date.now() + 1000 * 60 * 1000);
			expect(checkPasswordExpired(oldDate)).toBe(false);
		});
	});

	describe("comparePassword", (): void => {
		const rootPassword: string = "test_password";
		const { password, passwordSalt } = createPassword(rootPassword);
		it("Should return true if password and salt match", (): void => {
			expect(comparePassword(rootPassword, password, passwordSalt)).toBe(true);
		});
		it("Should return false if password not match", (): void => {
			expect(comparePassword("wrong_password", password, passwordSalt)).toBe(
				false,
			);
		});
		it("Should return false if salt not match", (): void => {
			expect(comparePassword(rootPassword, password, "wrong_salt")).toBe(false);
		});
		it("Should return false if hash not match", (): void => {
			const { password } = createPassword("anotherPassword");
			expect(comparePassword(rootPassword, password, passwordSalt)).toBe(false);
		});
	});
});
