import Link from "next/link";
import { ArrowLeft, Pencil } from "lucide-react";

import { buttonVariants } from "@/components/ui/button";
import { CreatorPaths } from "@/enums/AppPaths";
import type { ProductDetail } from "@/lib/actions/products";

import { ProductGallery } from "./ProductGallery";
import { ProductInfo } from "./ProductInfo";

const priceFormatter = new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
});

interface ShowProductProps {
    product: ProductDetail;
    /** Handle owner, used to build the back and edit links. */
    username: string;
}

/**
 * Full read-only product detail view: header actions, image gallery and
 * the product's information panels.
 */
export function ShowProduct({ product, username }: ShowProductProps) {
    const productsPath = CreatorPaths.products(username);

    return (
        <div className="mx-auto max-w-6xl space-y-6 p-6">
            {/* Header */}
            <div className="flex items-center justify-between gap-4">
                <Link
                    href={productsPath}
                    className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"
                >
                    <ArrowLeft className="h-4 w-4" />
                    Back to Products
                </Link>

                {/*
                  * Styled as a button but rendered as a real <a>: this
                  * navigates, so Base UI's <Button> would warn about losing
                  * native button semantics.
                  */}
                <Link
                    href={`${productsPath}/${product.id}/edit`}
                    className={buttonVariants()}
                >
                    <Pencil className="h-4 w-4" />
                    Edit Product
                </Link>
            </div>

            {/* Title */}
            <div className="space-y-1">
                <h1 className="text-3xl font-bold">{product.name}</h1>

                <p className="text-muted-foreground">
                    {product.category?.name ?? "Uncategorized"} ·{" "}
                    {priceFormatter.format(product.price)}
                </p>
            </div>

            <ProductGallery
                images={product.images}
                productName={product.name}
            />

            <ProductInfo product={product} />
        </div>
    );
}
