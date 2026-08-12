"use client";

import { useState } from "react";
import { Loader2, ShoppingCart } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
    Sheet,
    SheetContent,
    SheetDescription,
    SheetFooter,
    SheetHeader,
    SheetTitle,
    SheetTrigger,
} from "@/components/ui/sheet";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { useCart, useClearCart } from "@/hooks/useCart";
import { useCheckout } from "@/hooks/useCheckout";
import { priceFormatter } from "@/lib/format";
import { CartLineItem } from "./CartLineItem";

/**
 * Cart trigger plus the slide-over panel that shows its contents.
 *
 * Lives in the top bar. The cart itself is a cookie, so this works for
 * signed-out visitors too.
 */
export function CartSheet() {
    const [open, setOpen] = useState(false);

    const { data: cart, isPending, isError, error } = useCart();
    const clear = useClearCart();
    const checkout = useCheckout();

    const items = cart?.items ?? [];
    const itemCount = cart?.itemCount ?? 0;

    return (
        <Sheet open={open} onOpenChange={setOpen}>
            <SheetTrigger
                render={
                    <Button
                        variant="ghost"
                        className="relative flex h-9 items-center gap-2 px-2"
                    />
                }
            >
                <ShoppingCart className="h-4 w-4" />

                {itemCount > 0 && (
                    <span className="absolute -right-0.5 -top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-primary px-1 text-[10px] font-medium text-primary-foreground tabular-nums">
                        {itemCount > 99 ? "99+" : itemCount}
                    </span>
                )}

                <span className="sr-only">
                    {itemCount > 0
                        ? `Shopping cart, ${itemCount} item${itemCount === 1 ? "" : "s"}`
                        : "Shopping cart, empty"}
                </span>
            </SheetTrigger>

            <SheetContent side="right" className="w-full sm:max-w-md">
                <SheetHeader>
                    <SheetTitle>Your cart</SheetTitle>
                    <SheetDescription>
                        {itemCount > 0
                            ? `${itemCount} item${itemCount === 1 ? "" : "s"} in your cart`
                            : "Nothing here yet."}
                    </SheetDescription>
                </SheetHeader>

                <Separator />

                <div className="flex-1 overflow-y-auto px-4">
                    {isPending ? (
                        <div className="space-y-4 py-4">
                            {Array.from({ length: 3 }).map((_, index) => (
                                <Skeleton key={index} className="h-20 rounded-lg" />
                            ))}
                        </div>
                    ) : isError ? (
                        <div className="rounded-xl border border-destructive/50 bg-destructive/5 p-4">
                            <p className="font-medium text-destructive">
                                Could not load your cart
                            </p>
                            <p className="text-sm text-muted-foreground">
                                {error.message}
                            </p>
                        </div>
                    ) : items.length === 0 ? (
                        <div className="flex flex-col items-center gap-2 py-12 text-muted-foreground">
                            <ShoppingCart className="h-8 w-8" />
                            <p className="text-sm">Your cart is empty</p>
                        </div>
                    ) : (
                        <ul className="divide-y">
                            {items.map((item) => (
                                <CartLineItem
                                    key={item.productId}
                                    item={item}
                                    onNavigate={() => setOpen(false)}
                                />
                            ))}
                        </ul>
                    )}
                </div>

                {items.length > 0 && (
                    <SheetFooter>
                        <Separator />

                        <div className="flex items-center justify-between pt-2">
                            <span className="text-sm text-muted-foreground">
                                Subtotal
                            </span>
                            <span className="text-lg font-bold">
                                {priceFormatter.format(cart?.subtotal ?? 0)}
                            </span>
                        </div>

                        <Button
                            size="lg"
                            className="w-full justify-center"
                            disabled={checkout.isPending}
                            onClick={() => checkout.mutate()}
                        >
                            {checkout.isPending ? (
                                <Loader2 className="h-4 w-4 animate-spin" />
                            ) : (
                                "Checkout"
                            )}
                        </Button>

                        <Button
                            variant="ghost"
                            size="sm"
                            className="w-full justify-center"
                            disabled={clear.isPending}
                            onClick={() => clear.mutate()}
                        >
                            Clear cart
                        </Button>
                    </SheetFooter>
                )}
            </SheetContent>
        </Sheet>
    );
}
