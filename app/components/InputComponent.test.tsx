import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";

import { TogglePasswordInput } from "@/app/components/InputComponent";

describe("TogglePasswordInput", () => {
    it("renders a plain input with no toggle when type is not password", () => {
        render(<TogglePasswordInput placeholder="Name" />);
        expect(screen.queryByRole("button")).toBeNull();
    });

    it("masks the value by default and reveals it on toggle", async () => {
        const user = userEvent.setup();
        render(<TogglePasswordInput type="password" placeholder="Password" />);

        const input = screen.getByPlaceholderText("Password");
        expect(input).toHaveAttribute("type", "password");

        const toggle = screen.getByRole("button", { name: /show password/i });
        expect(toggle).toHaveAttribute("aria-pressed", "false");

        await user.click(toggle);
        expect(input).toHaveAttribute("type", "text");
        expect(
            screen.getByRole("button", { name: /hide password/i }),
        ).toHaveAttribute("aria-pressed", "true");

        await user.click(screen.getByRole("button", { name: /hide password/i }));
        expect(input).toHaveAttribute("type", "password");
    });

    it("forwards typing to the input", async () => {
        const user = userEvent.setup();
        render(<TogglePasswordInput type="password" placeholder="Password" />);
        const input = screen.getByPlaceholderText("Password");
        await user.type(input, "hunter2");
        expect(input).toHaveValue("hunter2");
    });
});
