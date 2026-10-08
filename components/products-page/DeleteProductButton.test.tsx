import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, it, vi } from "vitest";

const { pushMock, mutateMock, useDeleteProductMock } = vi.hoisted(() => ({
    pushMock: vi.fn(),
    mutateMock: vi.fn(),
    useDeleteProductMock: vi.fn(),
}));

vi.mock("next/navigation", () => ({
    useRouter: () => ({ push: pushMock }),
}));

vi.mock("@/hooks/useOwnProducts", () => ({
    useDeleteProduct: useDeleteProductMock,
}));

import { DeleteProductButton } from "@/components/products-page/DeleteProductButton";

afterEach(() => {
    vi.clearAllMocks();
});

function setup(isPending = false) {
    useDeleteProductMock.mockReturnValue({
        mutate: mutateMock,
        isPending,
    });
}

describe("DeleteProductButton", () => {
    it("renders the trigger with its label and aria-label", () => {
        setup();
        render(
            <DeleteProductButton
                productId={42}
                productName="Cool Shirt"
                label="Delete Product"
            />,
        );

        expect(
            screen.getByRole("button", { name: /delete cool shirt/i }),
        ).toHaveTextContent("Delete Product");
    });

    it("opens the confirm dialog and triggers the mutation on confirm", async () => {
        setup();
        const user = userEvent.setup();
        render(
            <DeleteProductButton
                productId={42}
                productName="Cool Shirt"
                label="Delete Product"
            />,
        );

        await user.click(
            screen.getByRole("button", { name: /delete cool shirt/i }),
        );

        // Dialog confirmation copy appears once opened.
        expect(
            await screen.findByText(/delete .cool shirt.\?/i),
        ).toBeInTheDocument();

        await user.click(screen.getByRole("button", { name: /^delete$/i }));

        expect(mutateMock).toHaveBeenCalledTimes(1);
        expect(mutateMock.mock.calls[0][0]).toBe(42);
    });

    it("redirects after a successful delete when redirectTo is set", async () => {
        setup();
        mutateMock.mockImplementation((_id, opts) => {
            opts?.onSuccess?.({ success: true });
        });
        const user = userEvent.setup();
        render(
            <DeleteProductButton
                productId={7}
                productName="Mug"
                label="Delete Product"
                redirectTo="/@lucians/products"
            />,
        );

        await user.click(screen.getByRole("button", { name: /delete mug/i }));
        await user.click(screen.getByRole("button", { name: /^delete$/i }));

        await waitFor(() =>
            expect(pushMock).toHaveBeenCalledWith("/@lucians/products"),
        );
    });

    it("disables the trigger while a delete is pending", () => {
        setup(true);
        render(
            <DeleteProductButton
                productId={42}
                productName="Cool Shirt"
                label="Delete Product"
            />,
        );

        expect(
            screen.getByRole("button", { name: /delete cool shirt/i }),
        ).toBeDisabled();
    });
});
