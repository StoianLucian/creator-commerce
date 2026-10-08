import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, it, vi } from "vitest";

const { pushMock, signInMock } = vi.hoisted(() => ({
    pushMock: vi.fn(),
    signInMock: vi.fn(),
}));

vi.mock("next/navigation", () => ({
    useRouter: () => ({ push: pushMock }),
}));

vi.mock("@/lib/auth-client", () => ({
    authClient: { signIn: { username: signInMock } },
}));

import { LoginForm } from "@/app/components/LoginForm";
import { AppPaths } from "@/enums/AppPaths";

afterEach(() => {
    vi.clearAllMocks();
});

async function fillAndSubmit(username: string, password: string) {
    const user = userEvent.setup();
    await user.type(screen.getByPlaceholderText(/enter your username/i), username);
    await user.type(screen.getByPlaceholderText(/enter your password/i), password);
    await user.click(screen.getByRole("button", { name: /login/i }));
}

describe("LoginForm", () => {
    it("blocks submission and shows a validation error for a short password", async () => {
        render(<LoginForm />);
        await fillAndSubmit("lucians", "short");

        expect(await screen.findByText(/at least 8 characters/i)).toBeInTheDocument();
        expect(signInMock).not.toHaveBeenCalled();
    });

    it("signs in and redirects to the dashboard on success", async () => {
        signInMock.mockResolvedValue({ error: null });
        render(<LoginForm />);
        await fillAndSubmit("lucians", "supersecret");

        await waitFor(() =>
            expect(signInMock).toHaveBeenCalledWith({
                username: "lucians",
                password: "supersecret",
            }),
        );
        expect(pushMock).toHaveBeenCalledWith(AppPaths.DASHBOARD);
    });

    it("shows a verify-your-email message for EMAIL_NOT_VERIFIED", async () => {
        signInMock.mockResolvedValue({ error: { code: "EMAIL_NOT_VERIFIED" } });
        render(<LoginForm />);
        await fillAndSubmit("lucians", "supersecret");

        expect(await screen.findByText(/verify your email/i)).toBeInTheDocument();
        expect(pushMock).not.toHaveBeenCalled();
    });

    it("surfaces a generic error message otherwise", async () => {
        signInMock.mockResolvedValue({
            error: { code: "INVALID", message: "Invalid username or password" },
        });
        render(<LoginForm />);
        await fillAndSubmit("lucians", "supersecret");

        expect(
            await screen.findByText(/invalid username or password/i),
        ).toBeInTheDocument();
        expect(pushMock).not.toHaveBeenCalled();
    });
});
