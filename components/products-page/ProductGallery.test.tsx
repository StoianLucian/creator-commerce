import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, it, vi } from "vitest";

// next/image renders a plain <img> so we can assert on src/alt directly.
vi.mock("next/image", () => ({
    default: ({
        src,
        alt,
    }: {
        src: string;
        alt: string;
        [key: string]: unknown;
    }) => <img src={src} alt={alt} />,
}));

// Replace embla with a minimal stateful fake so thumbnail navigation (which
// drives the selected slide via `api.scrollTo`) is observable in jsdom.
vi.mock("@/components/ui/carousel", async () => {
    const { useRef, useEffect } = await import("react");

    function Carousel({
        children,
        setApi,
    }: {
        children: React.ReactNode;
        setApi?: (api: unknown) => void;
        opts?: unknown;
    }) {
        const apiRef = useRef<{
            selectedScrollSnap: () => number;
            scrollTo: (index: number) => void;
            on: (event: string, fn: () => void) => void;
            off: (event: string, fn: () => void) => void;
        } | null>(null);

        if (!apiRef.current) {
            let selected = 0;
            const listeners: Record<string, Array<() => void>> = {};
            apiRef.current = {
                selectedScrollSnap: () => selected,
                scrollTo: (index: number) => {
                    selected = index;
                    (listeners.select ?? []).forEach((fn) => fn());
                },
                on: (event, fn) => {
                    (listeners[event] ??= []).push(fn);
                },
                off: (event, fn) => {
                    listeners[event] = (listeners[event] ?? []).filter(
                        (f) => f !== fn,
                    );
                },
            };
        }

        useEffect(() => {
            setApi?.(apiRef.current);
        }, [setApi]);

        return <div data-testid="carousel">{children}</div>;
    }

    const passthrough =
        (testid: string) =>
        ({ children }: { children?: React.ReactNode }) => (
            <div data-testid={testid}>{children}</div>
        );

    return {
        Carousel,
        CarouselContent: passthrough("carousel-content"),
        CarouselItem: passthrough("carousel-item"),
        CarouselPrevious: () => <button type="button">Previous slide</button>,
        CarouselNext: () => <button type="button">Next slide</button>,
    };
});

import { ProductGallery } from "./ProductGallery";

afterEach(() => {
    vi.clearAllMocks();
});

const images = [
    { id: 1, imageUrl: "https://img.test/one.jpg" },
    { id: 2, imageUrl: "https://img.test/two.jpg" },
    { id: 3, imageUrl: "https://img.test/three.jpg" },
] as never;

describe("ProductGallery", () => {
    it("shows a placeholder when there are no images", () => {
        render(<ProductGallery images={[] as never} productName="Cool Shirt" />);
        expect(screen.getByText("No images yet")).toBeInTheDocument();
        expect(screen.queryByRole("button")).toBeNull();
    });

    it("renders a main image per slide and one thumbnail button per image", () => {
        render(<ProductGallery images={images} productName="Cool Shirt" />);

        // Main slides use the "<name> — image N" alt text.
        expect(
            screen.getByAltText("Cool Shirt — image 1"),
        ).toBeInTheDocument();
        expect(
            screen.getByAltText("Cool Shirt — image 2"),
        ).toBeInTheDocument();

        // One thumbnail navigation button per image.
        expect(
            screen.getByRole("button", { name: "Show image 1" }),
        ).toBeInTheDocument();
        expect(
            screen.getByRole("button", { name: "Show image 2" }),
        ).toBeInTheDocument();
        expect(
            screen.getByRole("button", { name: "Show image 3" }),
        ).toBeInTheDocument();
    });

    it("marks the first thumbnail current initially", () => {
        render(<ProductGallery images={images} productName="Cool Shirt" />);
        expect(
            screen.getByRole("button", { name: "Show image 1" }),
        ).toHaveAttribute("aria-current", "true");
        expect(
            screen.getByRole("button", { name: "Show image 2" }),
        ).toHaveAttribute("aria-current", "false");
    });

    it("selects the clicked thumbnail's slide", async () => {
        const user = userEvent.setup();
        render(<ProductGallery images={images} productName="Cool Shirt" />);

        await user.click(screen.getByRole("button", { name: "Show image 3" }));

        expect(
            screen.getByRole("button", { name: "Show image 3" }),
        ).toHaveAttribute("aria-current", "true");
        expect(
            screen.getByRole("button", { name: "Show image 1" }),
        ).toHaveAttribute("aria-current", "false");
    });

    it("hides thumbnails and arrows for a single image", () => {
        render(
            <ProductGallery
                images={[{ id: 1, imageUrl: "https://img.test/one.jpg" }] as never}
                productName="Cool Shirt"
            />,
        );
        expect(screen.queryByRole("button")).toBeNull();
        expect(
            screen.getByAltText("Cool Shirt — image 1"),
        ).toBeInTheDocument();
    });
});
