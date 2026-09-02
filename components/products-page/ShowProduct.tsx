import Link from "next/link";
import { ArrowLeft, Pencil } from "lucide-react";

import { buttonVariants } from "@/components/ui/button";
import { AddToCartButton } from "@/components/cart/AddToCartButton";
import { AppPaths, CreatorPaths } from "@/enums/AppPaths";
import type { ProductDetail } from "@/lib/actions/products";
import { priceFormatter } from "@/lib/format";
import { ProductGallery } from "./ProductGallery";
import { ProductInfo } from "./ProductInfo";

interface ShowProductProps {
    product: ProductDetail;
    /** Handle owner, used to build the back and edit links. */
    username: string;
    /** Whether the viewer owns this handle; gates the edit link. */
    isOwner?: boolean;
}

/**
 * Full read-only product detail view: header actions, image gallery and
 * the product's information panels.
 *
 * Renders for signed-out visitors too, so anything owner-only sits behind
 * `isOwner`.
 */
export function ShowProduct({
    product,
    username,
    isOwner = false,
}: ShowProductProps) {
    const productsPath = CreatorPaths.products(username);

    return (
        <div className="mx-auto max-w-6xl space-y-6 p-6">
            {/* Header */}
            <div className="flex items-center justify-between gap-4">
                <Link
                    href={isOwner ? productsPath : AppPaths.DASHBOARD}
                    className="inline-flex items-center gap-2 rounded-lg text-sm text-muted-foreground transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                >
                    <ArrowLeft className="h-4 w-4" />
                    {isOwner ? "Back to Products" : "Back to Explore"}
                </Link>

                <div className="flex items-center gap-2">
                    <AddToCartButton
                        productId={product.id}
                        productName={product.name}
                    />

                    {isOwner && (
                        <Link
                            href={`${productsPath}/${product.id}/edit`}
                            className={buttonVariants({ variant: "outline" })}
                        >
                            <Pencil className="h-4 w-4" />
                            Edit Product
                        </Link>
                    )}
                </div>
            </div>

            {/* Title */}
            <div className="space-y-1">
                <h1 className="text-3xl font-semibold tracking-tight">
                    {product.name}
                </h1>

                <p className="text-sm text-muted-foreground">
                    {product.category?.name ?? "Uncategorized"} ·{" "}
                    <span className="tabular-nums">
                        {priceFormatter.format(product.price)}
                    </span>
                </p>
            </div>

            <div className="flex flex-col gap-6 lg:flex-row">
                <ProductGallery
                    className="w-screen max-w-lg flex-1 lg:max-w-none"
                    images={product.images}
                    productName={product.name}
                />

                <ProductInfo product={product} />
            </div>
        </div>
    );
}
