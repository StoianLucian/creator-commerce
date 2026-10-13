"use client";

import Link from "next/link";
import { Minus, Package, Plus, Trash2 } from "lucide-react";
import { useTranslation } from "react-i18next";

import { Button } from "@/components/ui/button";
import { CreatorPaths } from "@/enums/AppPaths";
import { MAX_ITEM_QUANTITY } from "@/lib/cart/cart";
import type { CartItem } from "@/lib/data/cart";
import { useRemoveFromCart, useUpdateCartQuantity } from "@/hooks/useCart";
import { priceFormatter } from "@/lib/format";

interface CartLineItemProps {
    item: CartItem;
    /** Called after a link is followed, so the sheet can close itself. */
    onNavigate?: () => void;
}

export function CartLineItem({ item, onNavigate }: CartLineItemProps) {
    const { t } = useTranslation();
    const updateQuantity = useUpdateCartQuantity();
    const remove = useRemoveFromCart();

    const isBusy = updateQuantity.isPending || remove.isPending;

    const productHref = item.ownerUsername
        ? CreatorPaths.product(item.ownerUsername, item.productId, item.slug)
        : null;

    const setQuantity = (quantity: number) =>
        updateQuantity.mutate({ productId: item.productId, quantity });

    return (
        <li className="flex gap-3 py-4">
            {item.imageUrl ? (
                <img
                    src={item.imageUrl}
                    alt={item.name}
                    className="h-16 w-16 shrink-0 rounded-lg border object-cover"
                />
            ) : (
                <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-lg border bg-muted">
                    <Package className="h-5 w-5 text-muted-foreground" />
                </div>
            )}

            <div className="min-w-0 flex-1 space-y-2">
                <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                        {productHref ? (
                            <Link
                                href={productHref}
                                onClick={onNavigate}
                                className="block truncate rounded-sm font-medium transition-colors hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                            >
                                {item.name}
                            </Link>
                        ) : (
                            <p className="truncate font-medium">{item.name}</p>
                        )}

                        <p className="text-sm text-muted-foreground tabular-nums">
                            {t("cart.each", { price: priceFormatter.format(item.price) })}
                        </p>
                    </div>

                    <span className="shrink-0 font-medium tabular-nums">
                        {priceFormatter.format(item.lineTotal)}
                    </span>
                </div>

                <div className="flex items-center gap-2">
                    <div className="flex items-center gap-1 rounded-lg border p-0.5">
                        <Button
                            variant="ghost"
                            size="icon-xs"
                            disabled={isBusy}
                            onClick={() => setQuantity(item.quantity - 1)}
                            aria-label={t("cart.decreaseQty", { name: item.name })}
                        >
                            <Minus />
                        </Button>

                        <span
                            aria-live="polite"
                            className="min-w-6 text-center text-sm tabular-nums"
                        >
                            {item.quantity}
                        </span>

                        <Button
                            variant="ghost"
                            size="icon-xs"
                            disabled={isBusy || item.quantity >= MAX_ITEM_QUANTITY}
                            onClick={() => setQuantity(item.quantity + 1)}
                            aria-label={t("cart.increaseQty", { name: item.name })}
                        >
                            <Plus />
                        </Button>
                    </div>

                    <Button
                        variant="ghost"
                        size="icon-xs"
                        disabled={isBusy}
                        onClick={() => remove.mutate({ productId: item.productId })}
                        aria-label={t("cart.removeItem", { name: item.name })}
                    >
                        <Trash2 />
                    </Button>
                </div>
            </div>
        </li>
    );
}
