import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, it, vi } from "vitest";

const { pushMock, resetPasswordMock, toastSuccessMock, toastErrorMock } = vi.hoisted(
    () => ({
        pushMock: vi.fn(),
        resetPasswordMock: vi.fn(),
        toastSuccessMock: vi.fn(),
        toastErrorMock: vi.fn(),
    }),
);

vi.mock("next/navigation", () => ({
    useRouter: () => ({ push: pushMock, refresh: vi.fn() }),
}));

vi.mock("@/lib/auth-client", () => ({
    authClient: { resetPassword: resetPasswordMock },
}));

vi.mock("sonner", () => ({
    toast: { success: toastSuccessMock, error: toastErrorMock },
}));

import { ResetPasswordForm } from "@/app/components/ResetPasswordForm";
import { AppPaths } from "@/enums/AppPaths";

afterEach(() => {
    vi.clearAllMocks();
});

async function fillAndSubmit(password: string, confirmPassword: string) {
    const user = userEvent.setup();
    await user.type(screen.getByPlaceholderText(/enter your new password/i), password);
    await user.type(
        screen.getByPlaceholderText(/confirm your new password/i),
        confirmPassword,
    );
    await user.click(screen.getByRole("button", { name: /reset password/i }));
}

describe("ResetPasswordForm", () => {
    it("shows the invalid-link state and no form when no token is provided", () => {
        render(<ResetPasswordForm />);

        expect(screen.getByText(/invalid reset link/i)).toBeInTheDocument();
        expect(screen.getByText(/request a new link/i)).toBeInTheDocument();
        expect(
            screen.queryByRole("button", { name: /reset password/i }),
        ).toBeNull();
    });

    it("blocks submission and shows a validation error when passwords do not match", async () => {
        render(<ResetPasswordForm token="tok-123" />);
        await fillAndSubmit("supersecret", "different1");

        expect(await screen.findByText(/passwords do not match/i)).toBeInTheDocument();
        expect(resetPasswordMock).not.toHaveBeenCalled();
    });

    it("resets the password, toasts, and redirects to login on success", async () => {
        resetPasswordMock.mockResolvedValue({ error: null });
        render(<ResetPasswordForm token="tok-123" />);
        await fillAndSubmit("supersecret", "supersecret");

        await waitFor(() =>
            expect(resetPasswordMock).toHaveBeenCalledWith({
                newPassword: "supersecret",
                token: "tok-123",
            }),
        );

        expect(toastSuccessMock).toHaveBeenCalledWith("Your password has been reset");
        expect(pushMock).toHaveBeenCalledWith(AppPaths.LOGIN);
    });

    it("surfaces the server error message when reset fails", async () => {
        resetPasswordMock.mockResolvedValue({
            error: { message: "Reset token expired" },
        });
        render(<ResetPasswordForm token="tok-123" />);
        await fillAndSubmit("supersecret", "supersecret");

        expect(await screen.findByText(/reset token expired/i)).toBeInTheDocument();
        expect(pushMock).not.toHaveBeenCalled();
    });
});
