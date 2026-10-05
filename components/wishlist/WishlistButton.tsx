"use client";

import { Heart, Loader2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { useToggleWishlist, useWishlistIds } from "@/hooks/useWishlist";
import { cn } from "@/lib/utils";

interface WishlistButtonProps {
    productId: number;
    productName: string;
    className?: string;
    size?: React.ComponentProps<typeof Button>["size"];
    variant?: React.ComponentProps<typeof Button>["variant"];
}

/**
 * Heart toggle used on the product cards and detail page. Reads the saved ids
 * to decide filled vs. outline, and toggles via the cookie wishlist action.
 *
 * The card is wrapped in a `<Link>`, so clicks are stopped from bubbling up
 * into a navigation.
 */
export function WishlistButton({
    productId,
    productName,
    className,
    size = "icon",
    variant = "secondary",
}: WishlistButtonProps) {
    const { data: ids = [] } = useWishlistIds();
    const toggle = useToggleWishlist();

    const wishlisted = ids.includes(productId);

    return (
        <Button
            type="button"
            size={size}
            variant={variant}
            className={cn("transition-colors", className)}
            disabled={toggle.isPending}
            aria-pressed={wishlisted}
            aria-label={
                wishlisted
                    ? `Remove ${productName} from wishlist`
                    : `Add ${productName} to wishlist`
            }
            onClick={(event) => {
                event.preventDefault();
                event.stopPropagation();
                toggle.mutate({ productId });
            }}
        >
            {toggle.isPending ? (
                <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
                // Monochrome palette: a filled heart (current color) marks a
                // saved product, an outline marks an unsaved one.
                <Heart className={cn("h-4 w-4", wishlisted && "fill-current")} />
            )}
        </Button>
    );
}
