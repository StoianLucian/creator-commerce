import { Package } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { ProductDetail } from "@/lib/actions/products";
import { priceFormatter } from "@/lib/format";

const statusVariant = {
    draft: "outline",
    active: "default",
    sold: "secondary",
} as const;

// Fixed timezone so the server-rendered date matches the client.
const dateFormatter = new Intl.DateTimeFormat("en-US", {
    dateStyle: "medium",
    timeZone: "UTC",
});

interface ProductInfoProps {
    product: ProductDetail;
}

/** Description, attributes, status and metadata panels for one product. */
export function ProductInfo({ product }: ProductInfoProps) {
    const variant =
        statusVariant[product.status as keyof typeof statusVariant] ?? "outline";

    return (
        <div className="grid gap-6 lg:grid-cols-3">
            <div className="space-y-6 lg:col-span-2">
                <Card>
                    <CardHeader>
                        <CardTitle className="text-lg">Description</CardTitle>
                    </CardHeader>

                    <CardContent>
                        {product.description ? (
                            <p className="whitespace-pre-line text-muted-foreground">
                                {product.description}
                            </p>
                        ) : (
                            <p className="flex items-center gap-2 text-sm text-muted-foreground">
                                <Package className="h-4 w-4" />
                                No description yet
                            </p>
                        )}
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle className="text-lg">
                            Product Information
                        </CardTitle>
                    </CardHeader>

                    <CardContent className="grid gap-4 sm:grid-cols-2">
                        <Info
                            label="Category"
                            value={product.category?.name ?? "Uncategorized"}
                        />
                        <Info
                            label="Price"
                            value={priceFormatter.format(product.price)}
                        />
                        <Info label="Sold" value={`${product.sold} units`} />
                        <Info label="Images" value={`${product.images.length}`} />
                    </CardContent>
                </Card>
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
                <Card>
                    <CardHeader>
                        <CardTitle className="text-lg">Status</CardTitle>
                    </CardHeader>

                    <CardContent>
                        <Badge variant={variant} className="capitalize">
                            {product.status}
                        </Badge>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle className="text-lg">Metadata</CardTitle>
                    </CardHeader>

                    <CardContent className="space-y-3">
                        <Info label="Product ID" value={`${product.id}`} />
                        <Info label="Slug" value={product.slug} />
                        <Info
                            label="Created"
                            value={
                                product.created_at
                                    ? dateFormatter.format(product.created_at)
                                    : "—"
                            }
                        />
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}

function Info({ label, value }: { label: string; value: string }) {
    return (
        <div>
            <p className="text-sm text-muted-foreground">{label}</p>
            <p className="font-medium wrap-break-word">{value}</p>
        </div>
    );
}
