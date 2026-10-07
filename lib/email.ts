import "server-only";

/**
 * Transactional email via Brevo (https://www.brevo.com) using its REST API.
 *
 * The module is imported by the Stripe webhook, whose primary job is to mark
 * orders "paid" — so nothing here is allowed to throw. A missing API key just
 * skips sending (with a warning), and send failures are logged, never
 * rethrown. Email is a nice-to-have side effect, not part of the order's
 * durability guarantee.
 */

const BREVO_ENDPOINT = "https://api.brevo.com/v3/smtp/email";

const apiKey = process.env.BREVO_API_KEY;

/**
 * The from-address. Must be a *verified sender* in your Brevo account
 * (Senders, Domains & Dedicated IPs → Senders). Accepts either a bare
 * address or the "Name <address>" form.
 */
const FROM = parseFrom(process.env.EMAIL_FROM ?? "Creator Commerce <no-reply@example.com>");

if (!apiKey) {
    console.warn(
        "BREVO_API_KEY is not set — order confirmation and seller emails will be skipped."
    );
}

function parseFrom(raw: string): { name: string; email: string } {
    const match = raw.match(/^\s*(.*?)\s*<(.+?)>\s*$/);
    if (match) {
        return { name: match[1] || "Creator Commerce", email: match[2] };
    }
    return { name: "Creator Commerce", email: raw.trim() };
}

/** A purchased line, in cents, mirroring the `order_items` snapshot columns. */
export type EmailLineItem = {
    productName: string;
    quantity: number;
    unitPrice: number;
    lineTotal: number;
};

async function send(args: {
    to: string | string[];
    subject: string;
    html: string;
}): Promise<void> {
    if (!apiKey) return;

    const recipients = (Array.isArray(args.to) ? args.to : [args.to]).map(
        (email) => ({ email })
    );

    try {
        const res = await fetch(BREVO_ENDPOINT, {
            method: "POST",
            headers: {
                "api-key": apiKey,
                "content-type": "application/json",
                accept: "application/json",
            },
            body: JSON.stringify({
                sender: FROM,
                to: recipients,
                subject: args.subject,
                htmlContent: args.html,
            }),
        });

        if (!res.ok) {
            const detail = await res.text().catch(() => "");
            console.error("Brevo rejected the email", res.status, detail);
        }
    } catch (error) {
        console.error("Sending email threw", error);
    }
}

/**
 * Account email-verification link, sent by Better Auth's `emailVerification`
 * hook on sign-up. `url` is Better Auth's `/api/auth/verify-email?token=...`
 * endpoint — clicking it marks the address verified and redirects to the
 * callback. escapeHtml doubles as attribute encoding (it escapes `&` and `"`),
 * so it's safe in both the href and the visible fallback link.
 */
export async function sendVerificationEmail(args: {
    to: string;
    url: string;
}): Promise<void> {
    const { to, url } = args;
    const safeUrl = escapeHtml(url);

    const html = layout(
        "Verify your email",
        `
        <p>Welcome to Creator Commerce! Confirm your email address to activate your account.</p>
        <p style="margin:24px 0;">
            <a href="${safeUrl}" style="display:inline-block;background:#111;color:#fff;text-decoration:none;padding:12px 20px;border-radius:8px;font-size:14px;">Verify email</a>
        </p>
        <p style="font-size:12px;color:#888;">If the button doesn't work, paste this link into your browser:<br>${safeUrl}</p>
        <p style="font-size:12px;color:#888;">If you didn't create this account, you can safely ignore this email.</p>`
    );

    await send({ to, subject: "Verify your email", html });
}

/**
 * Password-reset link, sent by Better Auth's `emailAndPassword.sendResetPassword`
 * hook. `url` is Better Auth's `/api/auth/reset-password/:token` endpoint —
 * clicking it validates the token and redirects to our reset page with the
 * token in the query string. escapeHtml doubles as attribute encoding (it
 * escapes `&` and `"`), so it's safe in both the href and the fallback link.
 */
export async function sendResetPasswordEmail(args: {
    to: string;
    url: string;
}): Promise<void> {
    const { to, url } = args;
    const safeUrl = escapeHtml(url);

    const html = layout(
        "Reset your password",
        `
        <p>We received a request to reset your Creator Commerce password. Click the button below to choose a new one.</p>
        <p style="margin:24px 0;">
            <a href="${safeUrl}" style="display:inline-block;background:#111;color:#fff;text-decoration:none;padding:12px 20px;border-radius:8px;font-size:14px;">Reset password</a>
        </p>
        <p style="font-size:12px;color:#888;">If the button doesn't work, paste this link into your browser:<br>${safeUrl}</p>
        <p style="font-size:12px;color:#888;">This link expires in 1 hour. If you didn't request a password reset, you can safely ignore this email.</p>`
    );

    await send({ to, subject: "Reset your password", html });
}

/**
 * Confirmation link for an email-address change, sent by Better Auth's
 * `user.changeEmail.sendChangeEmailConfirmation` hook to the user's *current*
 * address. Clicking it verifies the request and switches the account over to
 * `newEmail`. escapeHtml doubles as attribute encoding, so it's safe in both
 * the href and the visible fallback link.
 */
export async function sendChangeEmailConfirmation(args: {
    to: string;
    newEmail: string;
    url: string;
}): Promise<void> {
    const { to, newEmail, url } = args;
    const safeUrl = escapeHtml(url);

    const html = layout(
        "Confirm your new email",
        `
        <p>We received a request to change your Creator Commerce email to <strong>${escapeHtml(
            newEmail
        )}</strong>. Confirm the change by clicking the button below.</p>
        <p style="margin:24px 0;">
            <a href="${safeUrl}" style="display:inline-block;background:#111;color:#fff;text-decoration:none;padding:12px 20px;border-radius:8px;font-size:14px;">Confirm email change</a>
        </p>
        <p style="font-size:12px;color:#888;">If the button doesn't work, paste this link into your browser:<br>${safeUrl}</p>
        <p style="font-size:12px;color:#888;">If you didn't request this change, you can safely ignore this email — your address won't change.</p>`
    );

    await send({ to, subject: "Confirm your new email", html });
}

/** Amounts are stored in cents (Stripe's unit); render them as money. */
function money(cents: number, currency: string): string {
    return new Intl.NumberFormat("en-US", {
        style: "currency",
        currency: currency.toUpperCase(),
    }).format(cents / 100);
}

function escapeHtml(value: string): string {
    return value
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#39;");
}

function itemRows(items: EmailLineItem[], currency: string): string {
    return items
        .map(
            (item) => `
        <tr>
            <td style="padding:8px 0;border-bottom:1px solid #eee;">${escapeHtml(
                item.productName
            )} &times; ${item.quantity}</td>
            <td style="padding:8px 0;border-bottom:1px solid #eee;text-align:right;">${money(
                item.lineTotal,
                currency
            )}</td>
        </tr>`
        )
        .join("");
}

function layout(heading: string, body: string): string {
    return `
    <div style="font-family:-apple-system,Segoe UI,Roboto,Helvetica,Arial,sans-serif;max-width:520px;margin:0 auto;color:#111;">
        <h1 style="font-size:20px;margin:0 0 16px;">${escapeHtml(heading)}</h1>
        ${body}
        <p style="margin-top:24px;font-size:12px;color:#888;">Creator Commerce</p>
    </div>`;
}

/** Receipt sent to the buyer after payment succeeds. */
export async function sendOrderConfirmation(args: {
    to: string;
    orderId: number;
    items: EmailLineItem[];
    subtotal: number;
    currency: string;
}): Promise<void> {
    const { to, orderId, items, subtotal, currency } = args;

    const html = layout(
        "Thanks for your order!",
        `
        <p>Your order <strong>#${orderId}</strong> is confirmed. Here's what you bought:</p>
        <table style="width:100%;border-collapse:collapse;font-size:14px;">
            <tbody>${itemRows(items, currency)}</tbody>
            <tfoot>
                <tr>
                    <td style="padding:12px 0 0;font-weight:600;">Total</td>
                    <td style="padding:12px 0 0;font-weight:600;text-align:right;">${money(
                        subtotal,
                        currency
                    )}</td>
                </tr>
            </tfoot>
        </table>`
    );

    await send({ to, subject: `Your order #${orderId} is confirmed`, html });
}

/** Notification sent to a seller when one of their products sells. */
export async function sendSellerSaleNotification(args: {
    to: string;
    sellerName: string;
    orderId: number;
    items: EmailLineItem[];
    currency: string;
}): Promise<void> {
    const { to, sellerName, orderId, items, currency } = args;

    const total = items.reduce((sum, item) => sum + item.lineTotal, 0);

    const html = layout(
        `You made a sale, ${sellerName}!`,
        `
        <p>Order <strong>#${orderId}</strong> includes your products:</p>
        <table style="width:100%;border-collapse:collapse;font-size:14px;">
            <tbody>${itemRows(items, currency)}</tbody>
            <tfoot>
                <tr>
                    <td style="padding:12px 0 0;font-weight:600;">Your total</td>
                    <td style="padding:12px 0 0;font-weight:600;text-align:right;">${money(
                        total,
                        currency
                    )}</td>
                </tr>
            </tfoot>
        </table>`
    );

    await send({ to, subject: `You sold something! (order #${orderId})`, html });
}
