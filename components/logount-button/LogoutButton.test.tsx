import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, it, vi } from "vitest";

const { replaceMock, signOutMock } = vi.hoisted(() => ({
    replaceMock: vi.fn(),
    signOutMock: vi.fn(),
}));

vi.mock("next/navigation", () => ({
    useRouter: () => ({ replace: replaceMock }),
}));

vi.mock("@/lib/auth-client", () => ({
    authClient: { signOut: signOutMock },
}));

import { LogoutButton } from "@/components/logount-button/LogoutButton";
import { AppPaths } from "@/enums/AppPaths";

afterEach(() => {
    vi.clearAllMocks();
});

describe("LogoutButton", () => {
    it("signs out and redirects to login on success", async () => {
        const user = userEvent.setup();
        // Mirror better-auth's callback contract: it invokes fetchOptions.onSuccess.
        signOutMock.mockImplementation(async (opts: any) => {
            opts.fetchOptions.onSuccess();
        });

        render(<LogoutButton />);
        await user.click(screen.getByRole("button", { name: /log out/i }));

        await waitFor(() => expect(signOutMock).toHaveBeenCalledTimes(1));
        expect(replaceMock).toHaveBeenCalledWith(AppPaths.LOGIN);
    });

    it("does not redirect if sign out throws", async () => {
        const user = userEvent.setup();
        const errorSpy = vi.spyOn(console, "error").mockImplementation(() => {});
        signOutMock.mockRejectedValue(new Error("network"));

        render(<LogoutButton />);
        await user.click(screen.getByRole("button", { name: /log out/i }));

        await waitFor(() => expect(signOutMock).toHaveBeenCalledTimes(1));
        expect(replaceMock).not.toHaveBeenCalled();
        errorSpy.mockRestore();
    });
});
