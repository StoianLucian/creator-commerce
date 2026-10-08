import { describe, expect, it } from "vitest";

import {
    changeEmailSchema,
    changePasswordSchema,
    forgotPasswordSchema,
    loginSchema,
    profileSchema,
    registerSchema,
    resetPasswordSchema,
} from "@/form-validations/auth";

/** Collects the `path` of every issue so tests can assert where it failed. */
function issuePaths(result: { success: false; error: { issues: { path: PropertyKey[] }[] } }) {
    return result.error.issues.map((issue) => issue.path.join("."));
}

describe("loginSchema", () => {
    it("accepts a valid username + password", () => {
        expect(
            loginSchema.safeParse({ username: "lucians", password: "supersecret" })
                .success,
        ).toBe(true);
    });

    it("rejects a username shorter than 3 characters", () => {
        const result = loginSchema.safeParse({ username: "ab", password: "supersecret" });
        expect(result.success).toBe(false);
    });

    it("rejects usernames with characters that aren't URL-safe", () => {
        const result = loginSchema.safeParse({ username: "lu cians", password: "supersecret" });
        expect(result.success).toBe(false);
    });

    it("rejects a password shorter than 8 characters", () => {
        const result = loginSchema.safeParse({ username: "lucians", password: "short" });
        expect(result.success).toBe(false);
    });
});

describe("registerSchema", () => {
    const base = {
        username: "lucians",
        email: "lucians@example.com",
        password: "supersecret",
        confirmPassword: "supersecret",
    };

    it("accepts matching passwords and a valid email", () => {
        expect(registerSchema.safeParse(base).success).toBe(true);
    });

    it("flags a confirmPassword that doesn't match", () => {
        const result = registerSchema.safeParse({ ...base, confirmPassword: "different1" });
        expect(result.success).toBe(false);
        if (!result.success) expect(issuePaths(result)).toContain("confirmPassword");
    });

    it("rejects an invalid email", () => {
        const result = registerSchema.safeParse({ ...base, email: "not-an-email" });
        expect(result.success).toBe(false);
    });
});

describe("forgotPasswordSchema", () => {
    it("accepts a valid email", () => {
        expect(forgotPasswordSchema.safeParse({ email: "a@b.com" }).success).toBe(true);
    });

    it("rejects an invalid email", () => {
        expect(forgotPasswordSchema.safeParse({ email: "nope" }).success).toBe(false);
    });
});

describe("resetPasswordSchema", () => {
    it("accepts matching new passwords", () => {
        expect(
            resetPasswordSchema.safeParse({ password: "supersecret", confirmPassword: "supersecret" })
                .success,
        ).toBe(true);
    });

    it("flags a mismatch on confirmPassword", () => {
        const result = resetPasswordSchema.safeParse({
            password: "supersecret",
            confirmPassword: "mismatchX1",
        });
        expect(result.success).toBe(false);
        if (!result.success) expect(issuePaths(result)).toContain("confirmPassword");
    });
});

describe("profileSchema", () => {
    it("accepts a display name and valid username", () => {
        expect(profileSchema.safeParse({ name: "Lucian S", username: "lucians" }).success).toBe(
            true,
        );
    });

    it("requires a non-empty display name", () => {
        const result = profileSchema.safeParse({ name: "", username: "lucians" });
        expect(result.success).toBe(false);
        if (!result.success) expect(issuePaths(result)).toContain("name");
    });

    it("rejects an invalid username", () => {
        const result = profileSchema.safeParse({ name: "Lucian", username: "bad!" });
        expect(result.success).toBe(false);
        if (!result.success) expect(issuePaths(result)).toContain("username");
    });
});

describe("changeEmailSchema", () => {
    it("accepts a valid email and rejects garbage", () => {
        expect(changeEmailSchema.safeParse({ email: "new@example.com" }).success).toBe(true);
        expect(changeEmailSchema.safeParse({ email: "x" }).success).toBe(false);
    });
});

describe("changePasswordSchema", () => {
    const base = {
        currentPassword: "oldsecret1",
        newPassword: "newsecret1",
        confirmPassword: "newsecret1",
    };

    it("accepts a valid change where the new passwords match", () => {
        expect(changePasswordSchema.safeParse(base).success).toBe(true);
    });

    it("flags a confirmPassword that doesn't match the new password", () => {
        const result = changePasswordSchema.safeParse({ ...base, confirmPassword: "doesntmatch1" });
        expect(result.success).toBe(false);
        if (!result.success) expect(issuePaths(result)).toContain("confirmPassword");
    });

    it("rejects a new password shorter than 8 characters", () => {
        const result = changePasswordSchema.safeParse({
            currentPassword: "oldsecret1",
            newPassword: "short",
            confirmPassword: "short",
        });
        expect(result.success).toBe(false);
    });
});
