import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, it, vi } from "vitest";

const { signUpEmailMock, toastSuccessMock, toastErrorMock } = vi.hoisted(() => ({
    signUpEmailMock: vi.fn(),
    toastSuccessMock: vi.fn(),
    toastErrorMock: vi.fn(),
}));

vi.mock("next/navigation", () => ({
    useRouter: () => ({ push: vi.fn(), refresh: vi.fn() }),
}));

vi.mock("@/lib/auth-client", () => ({
    authClient: { signUp: { email: signUpEmailMock } },
}));

vi.mock("sonner", () => ({
    toast: { success: toastSuccessMock, error: toastErrorMock },
}));

import { RegisterForm } from "@/app/components/RegisterForm";
import { AppPaths } from "@/enums/AppPaths";

afterEach(() => {
    vi.clearAllMocks();
});

async function fillAndSubmit({
    username = "lucians",
    email = "lucians@example.com",
    password = "supersecret",
    confirmPassword = "supersecret",
}: Partial<Record<"username" | "email" | "password" | "confirmPassword", string>> = {}) {
    const user = userEvent.setup();
    await user.type(screen.getByPlaceholderText(/enter your username/i), username);
    await user.type(screen.getByPlaceholderText(/enter your email/i), email);
    await user.type(screen.getByPlaceholderText(/enter your password/i), password);
    await user.type(screen.getByPlaceholderText(/confirm your password/i), confirmPassword);
    await user.click(screen.getByRole("button", { name: /register/i }));
}

describe("RegisterForm", () => {
    it("blocks submission and shows a validation error when passwords do not match", async () => {
        render(<RegisterForm />);
        await fillAndSubmit({ password: "supersecret", confirmPassword: "different1" });

        expect(await screen.findByText(/passwords do not match/i)).toBeInTheDocument();
        expect(signUpEmailMock).not.toHaveBeenCalled();
    });

    it("signs up and shows the check-your-inbox confirmation on success", async () => {
        signUpEmailMock.mockResolvedValue({ error: null });
        render(<RegisterForm />);
        await fillAndSubmit();

        await waitFor(() =>
            expect(signUpEmailMock).toHaveBeenCalledWith({
                name: "lucians",
                username: "lucians",
                email: "lucians@example.com",
                password: "supersecret",
                callbackURL: AppPaths.EMAIL_VERIFIED,
            }),
        );

        expect(toastSuccessMock).toHaveBeenCalledWith(
            "Verification email sent to lucians@example.com",
        );
        expect(await screen.findByText(/check your inbox/i)).toBeInTheDocument();
        expect(screen.getByText(/lucians@example\.com/)).toBeInTheDocument();
    });

    it("surfaces the server error message when sign up fails", async () => {
        signUpEmailMock.mockResolvedValue({
            error: { message: "Email already in use" },
        });
        render(<RegisterForm />);
        await fillAndSubmit();

        expect(await screen.findByText(/email already in use/i)).toBeInTheDocument();
        expect(screen.queryByText(/check your inbox/i)).toBeNull();
    });
});
