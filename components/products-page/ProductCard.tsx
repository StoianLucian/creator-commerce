"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { Package, Pencil } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AddToCartButton } from "@/components/cart/AddToCartButton";
import { DeleteProductButton } from "@/components/products-page/DeleteProductButton";
import { CreatorPaths } from "@/enums/AppPaths";
import type { ProductWithRelations } from "@/lib/actions/products";
import { priceFormatter } from "@/lib/format";
import { cn } from "@/lib/utils";

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

    const variant =
        statusVariant[product.status as keyof typeof statusVariant] ?? "outline";

    const coverImage = product.images[0];
    const isDeleted = Boolean(product.deleted_at);

    const card = (
            <Card
                className={cn(
                    "h-full shadow-sm transition-all",
                    isDeleted
                        ? "opacity-60"
                        : "group-hover:border-primary/40 group-hover:shadow-md",
                )}
            >
                <CardHeader>
                    <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0 space-y-1">
                            <CardTitle className="truncate text-lg">
                                {product.name}
                            </CardTitle>

                            <p className="text-sm text-muted-foreground">
                                {product.sold} sold
                            </p>
                        </div>

                        {isDeleted ? (
                            <Badge variant="destructive">Deleted</Badge>
                        ) : (
                            <Badge variant={variant} className="capitalize">
                                {product.status}
                            </Badge>
                        )}
                    </div>
                </CardHeader>

                <CardContent className="space-y-6">
                    {coverImage ? (
                        <img
                            src={coverImage.imageUrl}
                            alt={product.name}
                            className="aspect-video w-full rounded-lg border object-cover"
                        />
                    ) : (
                        <div className="flex aspect-video w-full items-center justify-center rounded-lg border bg-muted">
                            <Package className="h-6 w-6 text-muted-foreground" />
                        </div>
                    )}

                    {product.description ? (
                        <p className="line-clamp-2 text-sm text-muted-foreground">
                            {product.description}
                        </p>
                    ) : (
                        <p className="flex items-center gap-2 text-sm text-muted-foreground">
                            <Package className="h-4 w-4" />
                            No description yet
                        </p>
                    )}

                    <div className="flex items-center justify-between gap-3">
                        <span className="text-2xl font-semibold tabular-nums">
                            {priceFormatter.format(product.price)}
                        </span>

                        {/*
                          * The whole card is a link, so keep the button's
                          * click from bubbling up into a navigation. Deleted
                          * products have no actions.
                          */}
                        {!isDeleted && (
                            <div
                                className="flex items-center gap-2"
                                onClick={(event) => {
                                    event.preventDefault();
                                    event.stopPropagation();
                                }}
                            >
                                {editable && (
                                    <Button
                                        variant="outline"
                                        size="sm"
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
                                )}

                                {editable && (
                                    <DeleteProductButton
                                        productId={product.id}
                                        productName={product.name}
                                    />
                                )}

                                <AddToCartButton
                                    productId={product.id}
                                    productName={product.name}
                                    size="sm"
                                    variant="outline"
                                />
                            </div>
                        )}
                    </div>
                </CardContent>
            </Card>
    );

    // A deleted product's detail page 404s, so drop the link and just show
    // the dimmed, "Deleted"-badged card in the owner's own list.
    if (isDeleted) {
        return <div className="block rounded-xl">{card}</div>;
    }

    return (
        <Link
            href={CreatorPaths.product(
                product.owner.username ?? "",
                product.id,
                product.slug,
            )}
            className="group block rounded-xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
            {card}
        </Link>
    );
}
