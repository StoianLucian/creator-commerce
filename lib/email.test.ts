import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";

// Neutralize the server-only import guard.
vi.mock("server-only", () => ({}));

const FROM = "Creator Commerce <no-reply@test.com>";
const BREVO_ENDPOINT = "https://api.brevo.com/v3/smtp/email";

/**
 * The module reads process.env.BREVO_API_KEY / EMAIL_FROM at import time, so
 * each test resets modules and re-imports after stubbing env.
 */
function freshFetch(impl?: () => Promise<unknown>) {
    const fetchMock = vi.fn(
        impl ?? (async () => ({ ok: true, text: async () => "" }))
    );
    vi.stubGlobal("fetch", fetchMock);
    return fetchMock;
}

async function importEmail() {
    return import("@/lib/email");
}

beforeEach(() => {
    vi.resetModules();
    vi.unstubAllEnvs();
    vi.unstubAllGlobals();
    // Silence the console.warn/error the module emits.
    vi.spyOn(console, "warn").mockImplementation(() => {});
    vi.spyOn(console, "error").mockImplementation(() => {});
});

afterEach(() => {
    vi.restoreAllMocks();
    vi.unstubAllEnvs();
    vi.unstubAllGlobals();
});

function withKey() {
    vi.stubEnv("BREVO_API_KEY", "test-key");
    vi.stubEnv("EMAIL_FROM", FROM);
}

/** Pulls the parsed JSON body + headers out of the single fetch call. */
function readCall(fetchMock: ReturnType<typeof vi.fn>) {
    expect(fetchMock).toHaveBeenCalledTimes(1);
    const [url, init] = fetchMock.mock.calls[0] as [string, RequestInit];
    expect(url).toBe(BREVO_ENDPOINT);
    const body = JSON.parse(init.body as string);
    return { url, init, body, headers: init.headers as Record<string, string> };
}

describe("email senders (with API key)", () => {
    it("sendVerificationEmail posts to Brevo with recipient + subject", async () => {
        withKey();
        const fetchMock = freshFetch();
        const { sendVerificationEmail } = await importEmail();

        await sendVerificationEmail({
            to: "user@test.com",
            url: "https://app/verify?token=abc",
        });

        const { body, headers } = readCall(fetchMock);
        expect(headers["api-key"]).toBe("test-key");
        expect(body.to).toEqual([{ email: "user@test.com" }]);
        expect(body.subject).toBe("Verify your email");
    });

    it("sendResetPasswordEmail posts to Brevo with recipient + subject", async () => {
        withKey();
        const fetchMock = freshFetch();
        const { sendResetPasswordEmail } = await importEmail();

        await sendResetPasswordEmail({
            to: "reset@test.com",
            url: "https://app/reset?token=xyz",
        });

        const { body, headers } = readCall(fetchMock);
        expect(headers["api-key"]).toBe("test-key");
        expect(body.to).toEqual([{ email: "reset@test.com" }]);
        expect(body.subject).toBe("Reset your password");
    });

    it("sendChangeEmailConfirmation posts to Brevo with recipient + subject", async () => {
        withKey();
        const fetchMock = freshFetch();
        const { sendChangeEmailConfirmation } = await importEmail();

        await sendChangeEmailConfirmation({
            to: "current@test.com",
            newEmail: "new@test.com",
            url: "https://app/change?token=qqq",
        });

        const { body, headers } = readCall(fetchMock);
        expect(headers["api-key"]).toBe("test-key");
        expect(body.to).toEqual([{ email: "current@test.com" }]);
        expect(body.subject).toBe("Confirm your new email");
        expect(body.htmlContent).toContain("new@test.com");
    });

    it("sendOrderConfirmation posts to Brevo with recipient + subject", async () => {
        withKey();
        const fetchMock = freshFetch();
        const { sendOrderConfirmation } = await importEmail();

        await sendOrderConfirmation({
            to: "buyer@test.com",
            orderId: 42,
            items: [
                {
                    productName: "Widget",
                    quantity: 2,
                    unitPrice: 500,
                    lineTotal: 1000,
                },
            ],
            subtotal: 1000,
            currency: "usd",
        });

        const { body, headers } = readCall(fetchMock);
        expect(headers["api-key"]).toBe("test-key");
        expect(body.to).toEqual([{ email: "buyer@test.com" }]);
        expect(body.subject).toBe("Your order #42 is confirmed");
    });

    it("sendSellerSaleNotification posts to Brevo with recipient + subject", async () => {
        withKey();
        const fetchMock = freshFetch();
        const { sendSellerSaleNotification } = await importEmail();

        await sendSellerSaleNotification({
            to: "seller@test.com",
            sellerName: "Jo",
            orderId: 42,
            items: [
                {
                    productName: "Widget",
                    quantity: 1,
                    unitPrice: 500,
                    lineTotal: 500,
                },
            ],
            currency: "usd",
        });

        const { body, headers } = readCall(fetchMock);
        expect(headers["api-key"]).toBe("test-key");
        expect(body.to).toEqual([{ email: "seller@test.com" }]);
        expect(body.subject).toBe("You sold something! (order #42)");
    });
});

describe("email senders (without API key)", () => {
    it("skips fetch when BREVO_API_KEY is unset", async () => {
        // No withKey() — leave the key unstubbed/undefined.
        vi.stubEnv("BREVO_API_KEY", undefined);
        const fetchMock = freshFetch();
        const { sendVerificationEmail } = await importEmail();

        await sendVerificationEmail({
            to: "user@test.com",
            url: "https://app/verify?token=abc",
        });

        expect(fetchMock).not.toHaveBeenCalled();
    });
});

describe("email senders (fetch failures)", () => {
    it("never throws when fetch rejects", async () => {
        withKey();
        const fetchMock = freshFetch(async () => {
            throw new Error("network down");
        });
        const { sendOrderConfirmation } = await importEmail();

        await expect(
            sendOrderConfirmation({
                to: "buyer@test.com",
                orderId: 1,
                items: [],
                subtotal: 0,
                currency: "usd",
            })
        ).resolves.toBeUndefined();

        expect(fetchMock).toHaveBeenCalledTimes(1);
    });

    it("never throws when Brevo responds with a non-ok status", async () => {
        withKey();
        freshFetch(async () => ({
            ok: false,
            status: 400,
            text: async () => "bad request",
        }));
        const { sendResetPasswordEmail } = await importEmail();

        await expect(
            sendResetPasswordEmail({
                to: "x@test.com",
                url: "https://app/reset",
            })
        ).resolves.toBeUndefined();
    });
});
