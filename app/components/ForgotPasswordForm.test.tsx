import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, it, vi } from "vitest";

const { requestPasswordResetMock } = vi.hoisted(() => ({
    requestPasswordResetMock: vi.fn(),
}));

vi.mock("next/navigation", () => ({
    useRouter: () => ({ push: vi.fn(), refresh: vi.fn() }),
}));

vi.mock("@/lib/auth-client", () => ({
    authClient: { requestPasswordReset: requestPasswordResetMock },
}));

import { ForgotPasswordForm } from "@/app/components/ForgotPasswordForm";
import { AppPaths } from "@/enums/AppPaths";

afterEach(() => {
    vi.clearAllMocks();
});

async function fillAndSubmit(email: string) {
    const user = userEvent.setup();
    await user.type(screen.getByPlaceholderText(/enter your email/i), email);
    await user.click(screen.getByRole("button", { name: /send reset link/i }));
}

describe("ForgotPasswordForm", () => {
    it("blocks submission and shows a validation error for an invalid email", async () => {
        render(<ForgotPasswordForm />);
        await fillAndSubmit("not-an-email");

        expect(await screen.findByText(/invalid email address/i)).toBeInTheDocument();
        expect(requestPasswordResetMock).not.toHaveBeenCalled();
    });

    it("requests a reset link and shows the confirmation on success", async () => {
        requestPasswordResetMock.mockResolvedValue({ error: null });
        render(<ForgotPasswordForm />);
        await fillAndSubmit("lucians@example.com");

        await waitFor(() =>
            expect(requestPasswordResetMock).toHaveBeenCalledWith({
                email: "lucians@example.com",
                redirectTo: AppPaths.RESET_PASSWORD,
            }),
        );

        expect(await screen.findByText(/check your inbox/i)).toBeInTheDocument();
        expect(screen.getByText(/lucians@example\.com/)).toBeInTheDocument();
    });

    it("surfaces the server error message when the request fails", async () => {
        requestPasswordResetMock.mockResolvedValue({
            error: { message: "Too many requests" },
        });
        render(<ForgotPasswordForm />);
        await fillAndSubmit("lucians@example.com");

        expect(await screen.findByText(/too many requests/i)).toBeInTheDocument();
        expect(screen.queryByText(/check your inbox/i)).toBeNull();
    });
});
