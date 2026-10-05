"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { Eye, ImageIcon, Pencil } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { AddToCartButton } from "@/components/cart/AddToCartButton";
import { WishlistButton } from "@/components/wishlist/WishlistButton";
import { DeleteProductButton } from "@/components/products-page/DeleteProductButton";
import { CreatorPaths } from "@/enums/AppPaths";
import type { ProductWithRelations } from "@/lib/actions/products";
import { priceFormatter } from "@/lib/format";
import { cn } from "@/lib/utils";

// The app's palette is monochrome, so status is conveyed by badge variant
// (solid = active, outline = draft, muted = sold) rather than hue.
const statusVariant = {
    draft: "outline",
    active: "default",
    sold: "secondary",
} as const;

interface ProductCardProps {
    product: ProductWithRelations;
    editable?: boolean;
}

export function ProductCard({ product, editable }: ProductCardProps) {
    const router = useRouter();

    const coverImage = product.images[0];
    const isDeleted = Boolean(product.deleted_at);

    const badgeVariant = isDeleted
        ? "destructive"
        : statusVariant[product.status as keyof typeof statusVariant] ?? "outline";

    // Active is the one status that gets a color accent (green) — everything
    // else stays on the monochrome palette.
    const isActive = !isDeleted && product.status === "active";

    const detailHref = CreatorPaths.product(
        product.owner.username ?? "",
        product.id,
        product.slug,
    );

    const card = (
        <Card
            className={cn(
                "group/card relative h-full gap-3 p-3 transition-all",
                isDeleted
                    ? "opacity-60"
                    : "group-hover:shadow-md group-hover:ring-foreground/20",
            )}
        >
            {/* Inset media with a rounded frame and the status badge overlaid. */}
            <div className="relative aspect-[4/3] w-full overflow-hidden rounded-lg bg-muted">
                {coverImage ? (
                    <img
                        src={coverImage.imageUrl}
                        alt={product.name}
                        className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                    />
                ) : (
                    <div className="flex h-full w-full items-center justify-center">
                        <ImageIcon className="h-8 w-8 text-muted-foreground/50" />
                    </div>
                )}

                {/*
                  * Wishlist heart, shown only when browsing other people's
                  * products (Explore, detail, the wishlist page) — not in the
                  * owner's own editable list. Overlaid opposite the status
                  * badge; its own handler stops the card's link navigation.
                  */}
                {!editable && !isDeleted && (
                    <div className="absolute left-2 top-2">
                        <WishlistButton
                            productId={product.id}
                            productName={product.name}
                            size="icon-sm"
                            variant="secondary"
                            className="rounded-full bg-background/80 shadow-sm backdrop-blur-sm"
                        />
                    </div>
                )}

                <div className="absolute right-2 top-2">
                    <Badge
                        variant={badgeVariant}
                        className={cn(
                            "capitalize shadow-sm",
                            // Outline is transparent, so back it for legibility
                            // over the product image.
                            badgeVariant === "outline" &&
                                "bg-background/80 backdrop-blur-sm",
                        )}
                    >
                        {isDeleted ? "Deleted" : product.status}
                    </Badge>
                </div>
            </div>

            {/* Title + short description. */}
            <div className="flex flex-1 flex-col gap-1">
                <h3 className="truncate font-medium leading-snug">{product.name}</h3>
                <p className="truncate text-sm text-muted-foreground">
                    {product.description || "No description yet"}
                </p>
            </div>

            {/* Price and units sold. */}
            <div className="flex items-baseline justify-between gap-2">
                <span className="text-lg font-semibold tabular-nums">
                    {priceFormatter.format(product.price)}
                </span>
                <span className="text-sm text-muted-foreground">
                    {product.sold} sold
                </span>
            </div>

            {/*
              * The whole card is a link, so keep clicks on the action row from
              * bubbling up into a navigation. Deleted products have no actions.
              */}
            {!isDeleted && (
                <div
                    className="grid grid-cols-3 gap-2"
                    onClick={(event) => {
                        event.preventDefault();
                        event.stopPropagation();
                    }}
                >
                    {editable ? (
                        <>
                            <Button
                                variant="outline"
                                size="sm"
                                className="w-full"
                                onClick={() =>
                                    router.push(
                                        CreatorPaths.productEdit(
                                            product.owner.username ?? "",
                                            product.id,
                                        ),
                                    )
                                }
                            >
                                <Pencil className="h-4 w-4" />
                                Edit
                            </Button>

                            <DeleteProductButton
                                productId={product.id}
                                productName={product.name}
                                label="Delete"
                                variant="outline"
                                size="sm"
                                className="w-full"
                            />

                            <Button
                                variant="outline"
                                size="sm"
                                className="w-full"
                                onClick={() => router.push(detailHref)}
                            >
                                <Eye className="h-4 w-4" />
                                View
                            </Button>
                        </>
                    ) : (
                        <AddToCartButton
                            productId={product.id}
                            productName={product.name}
                            size="sm"
                            className="col-span-3 w-full"
                        />
                    )}
                </div>
            )}
        </Card>
    );

    // A deleted product's detail page 404s, so drop the link and just show
    // the dimmed, "Deleted"-badged card in the owner's own list.
    if (isDeleted) {
        return <div className="block rounded-xl">{card}</div>;
    }

    return (
        <Link
            href={detailHref}
            className="group block rounded-xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
            {card}
        </Link>
    );
}
