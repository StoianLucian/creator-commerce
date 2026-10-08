import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, it, vi } from "vitest";

const {
    refreshMock,
    updateUserMock,
    changeEmailMock,
    changePasswordMock,
    toastSuccessMock,
    toastErrorMock,
} = vi.hoisted(() => ({
    refreshMock: vi.fn(),
    updateUserMock: vi.fn(),
    changeEmailMock: vi.fn(),
    changePasswordMock: vi.fn(),
    toastSuccessMock: vi.fn(),
    toastErrorMock: vi.fn(),
}));

vi.mock("next/navigation", () => ({
    useRouter: () => ({ push: vi.fn(), refresh: refreshMock }),
}));

vi.mock("@/lib/auth-client", () => ({
    authClient: {
        updateUser: updateUserMock,
        changeEmail: changeEmailMock,
        changePassword: changePasswordMock,
    },
}));

vi.mock("sonner", () => ({
    toast: { success: toastSuccessMock, error: toastErrorMock },
}));

import { SettingsForm } from "@/app/components/SettingsForm";
import { AppPaths } from "@/enums/AppPaths";

const user = {
    name: "Luc Ian",
    username: "lucians",
    email: "luc@example.com",
};

function renderForm() {
    render(<SettingsForm user={user} />);
}

afterEach(() => {
    vi.clearAllMocks();
});

describe("SettingsForm — Profile section", () => {
    it("blocks submission and shows a validation error for an invalid username", async () => {
        const u = userEvent.setup();
        renderForm();

        const username = screen.getByPlaceholderText("your_handle");
        await u.clear(username);
        await u.type(username, "ab");
        await u.click(screen.getByRole("button", { name: /save changes/i }));

        expect(
            await screen.findByText(/username must be at least 3 characters/i),
        ).toBeInTheDocument();
        expect(updateUserMock).not.toHaveBeenCalled();
    });

    it("updates the profile, toasts, and refreshes on success", async () => {
        updateUserMock.mockResolvedValue({ error: null });
        const u = userEvent.setup();
        renderForm();

        await u.click(screen.getByRole("button", { name: /save changes/i }));

        await waitFor(() =>
            expect(updateUserMock).toHaveBeenCalledWith({
                name: "Luc Ian",
                username: "lucians",
                displayUsername: "lucians",
            }),
        );
        expect(toastSuccessMock).toHaveBeenCalledWith("Profile updated");
        expect(refreshMock).toHaveBeenCalled();
    });

    it("maps USERNAME_IS_ALREADY_TAKEN to a friendly message", async () => {
        updateUserMock.mockResolvedValue({
            error: { code: "USERNAME_IS_ALREADY_TAKEN" },
        });
        const u = userEvent.setup();
        renderForm();

        await u.click(screen.getByRole("button", { name: /save changes/i }));

        expect(
            await screen.findByText(/that username is already taken/i),
        ).toBeInTheDocument();
        expect(refreshMock).not.toHaveBeenCalled();
    });
});

describe("SettingsForm — Email section", () => {
    it("blocks submission and shows a validation error for an invalid email", async () => {
        const u = userEvent.setup();
        renderForm();

        await u.type(screen.getByPlaceholderText("you@example.com"), "not-an-email");
        await u.click(screen.getByRole("button", { name: /send confirmation link/i }));

        expect(
            await screen.findByText(/invalid email address/i),
        ).toBeInTheDocument();
        expect(changeEmailMock).not.toHaveBeenCalled();
    });

    it("requests the change and shows the confirmation on success", async () => {
        changeEmailMock.mockResolvedValue({ error: null });
        const u = userEvent.setup();
        renderForm();

        await u.type(screen.getByPlaceholderText("you@example.com"), "new@example.com");
        await u.click(screen.getByRole("button", { name: /send confirmation link/i }));

        await waitFor(() =>
            expect(changeEmailMock).toHaveBeenCalledWith({
                newEmail: "new@example.com",
                callbackURL: AppPaths.SETTINGS,
            }),
        );
        expect(
            await screen.findByText(/check your current inbox/i),
        ).toBeInTheDocument();
    });

    it("surfaces the server error message when the change fails", async () => {
        changeEmailMock.mockResolvedValue({
            error: { message: "Email service unavailable" },
        });
        const u = userEvent.setup();
        renderForm();

        await u.type(screen.getByPlaceholderText("you@example.com"), "new@example.com");
        await u.click(screen.getByRole("button", { name: /send confirmation link/i }));

        expect(
            await screen.findByText(/email service unavailable/i),
        ).toBeInTheDocument();
        expect(screen.queryByText(/check your current inbox/i)).toBeNull();
    });
});

describe("SettingsForm — Password section", () => {
    async function fillPassword(
        u: ReturnType<typeof userEvent.setup>,
        current: string,
        next: string,
        confirm: string,
    ) {
        await u.type(
            screen.getByPlaceholderText(/enter your current password/i),
            current,
        );
        await u.type(screen.getByPlaceholderText(/enter your new password/i), next);
        await u.type(
            screen.getByPlaceholderText(/confirm your new password/i),
            confirm,
        );
        await u.click(screen.getByRole("button", { name: /change password/i }));
    }

    it("blocks submission and shows a validation error when passwords do not match", async () => {
        const u = userEvent.setup();
        renderForm();

        await fillPassword(u, "oldpassword", "newpassword", "different1");

        expect(
            await screen.findByText(/passwords do not match/i),
        ).toBeInTheDocument();
        expect(changePasswordMock).not.toHaveBeenCalled();
    });

    it("changes the password and toasts on success", async () => {
        changePasswordMock.mockResolvedValue({ error: null });
        const u = userEvent.setup();
        renderForm();

        await fillPassword(u, "oldpassword", "newpassword", "newpassword");

        await waitFor(() =>
            expect(changePasswordMock).toHaveBeenCalledWith({
                currentPassword: "oldpassword",
                newPassword: "newpassword",
                revokeOtherSessions: true,
            }),
        );
        expect(toastSuccessMock).toHaveBeenCalledWith("Password changed");
    });

    it("maps INVALID_PASSWORD to a friendly message", async () => {
        changePasswordMock.mockResolvedValue({
            error: { code: "INVALID_PASSWORD" },
        });
        const u = userEvent.setup();
        renderForm();

        await fillPassword(u, "oldpassword", "newpassword", "newpassword");

        expect(
            await screen.findByText(/your current password is incorrect/i),
        ).toBeInTheDocument();
        expect(toastSuccessMock).not.toHaveBeenCalled();
    });
});
