"use client";

import Link from "next/link";
import { Package, Plus } from "lucide-react";

import { ProductCard } from "@/components/products-page/ProductCard";
import { Button } from "@/components/ui/button";
import {
    Empty,
    EmptyContent,
    EmptyDescription,
    EmptyHeader,
    EmptyMedia,
    EmptyTitle,
} from "@/components/ui/empty";
import { Skeleton } from "@/components/ui/skeleton";
import { AppPaths } from "@/enums/AppPaths";
import { useProducts } from "@/hooks/useProducts";

function Products() {
    const { data: products, isPending, isError, error } = useProducts();

    if (isPending) {
        return (
            <>
                {Array.from({ length: 6 }).map((_, index) => (
                    <Skeleton key={index} className="h-48 rounded-xl" />
                ))}
            </>
        );
    }

    if (isError) {
        return (
            <div className="col-span-full rounded-xl border border-destructive/50 bg-destructive/5 p-6">
                <p className="font-medium text-destructive">
                    Could not load your products
                </p>
                <p className="text-sm text-muted-foreground">{error.message}</p>
            </div>
        );
    }

    if (products.length === 0) {
        return (
            <Empty className="col-span-full">
                <EmptyHeader>
                    <EmptyMedia variant="icon">
                        <Package />
                    </EmptyMedia>

                    <EmptyTitle>No products yet</EmptyTitle>

                    <EmptyDescription>
                        Create your first product to start selling.
                    </EmptyDescription>
                </EmptyHeader>

                <EmptyContent>
                    <Button render={<Link href={AppPaths.PRODUCTS_NEW} />}>
                        <Plus className="h-4 w-4" />
                        New Product
                    </Button>
                </EmptyContent>
            </Empty>
        );
    }

    return (
        <>
            {products.map((product) => (
                <ProductCard key={product.id} product={product} />
            ))}
        </>
    );
}

export default Products;
