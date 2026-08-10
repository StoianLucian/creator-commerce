import Link from "next/link";
import { Package } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useHandle } from "@/hooks/useHandle";
import type { ProductWithRelations } from "@/lib/actions/products";

const statusVariant = {
    draft: "outline",
    active: "default",
    sold: "secondary",
} as const;

const priceFormatter = new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
});

interface ProductCardProps {
    product: ProductWithRelations;
}

export function ProductCard({ product }: ProductCardProps) {
    // const { handle } = useHandle()
    const variant =
        statusVariant[product.status as keyof typeof statusVariant] ?? "outline";

    const coverImage = product.images[0];

    return (
        <Link
            href={`/dashboard/${product.owner.username}/${product.id}/${product.slug}`}
            className="group block rounded-xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
        >
            <Card className="h-full transition group-hover:ring-primary group-hover:shadow-md m-5">
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

                        <Badge variant={variant} className="capitalize">
                            {product.status}
                        </Badge>
                    </div>
                </CardHeader>

                <CardContent className="space-y-6">
                    {coverImage ? (
                        <img
                            src={coverImage.imageUrl}
                            alt={product.name}
                            className="aspect-video w-full rounded-lg object-cover"
                        />
                    ) : (
                        <div className="flex aspect-video w-full items-center justify-center rounded-lg bg-muted">
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

                    <span className="block text-2xl font-bold">
                        {priceFormatter.format(product.price)}
                    </span>
                </CardContent>
            </Card>
        </Link>
    );
}
