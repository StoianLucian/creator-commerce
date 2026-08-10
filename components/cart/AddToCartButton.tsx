"use client";

import { Loader2, ShoppingCart } from "lucide-react";

import { Button } from "@/components/ui/button";
import { useAddToCart } from "@/hooks/useCart";
import { cn } from "@/lib/utils";

interface AddToCartButtonProps {
    productId: number;
    productName: string;
    quantity?: number;
    className?: string;
    size?: React.ComponentProps<typeof Button>["size"];
    variant?: React.ComponentProps<typeof Button>["variant"];
}

export function AddToCartButton({
    productId,
    productName,
    quantity = 1,
    className,
    size,
    variant,
}: AddToCartButtonProps) {
    const addToCart = useAddToCart();

    return (
        <Button
            size={size}
            variant={variant}
            className={cn("justify-center", className)}
            disabled={addToCart.isPending}
            onClick={() => addToCart.mutate({ productId, quantity })}
            aria-label={`Add ${productName} to cart`}
        >
            {addToCart.isPending ? (
                <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
                <ShoppingCart className="h-4 w-4" />
            )}
            Add to cart
        </Button>
    );
}
