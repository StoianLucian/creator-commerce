// app/products/[id]/page.tsx

import Link from "next/link";
import { ArrowLeft, Pencil } from "lucide-react";

interface ProductPageProps {
    params: Promise<{
        id: string;
    }>;
}

export default async function Product({
    params,
}: ProductPageProps) {
    const { id } = await params;

    // Replace with your API/database call
    const product = {
        id,
        name: "MacBook Pro 16”",
        sku: "MBP-001",
        description:
            "Powerful laptop designed for professionals with the latest Apple silicon.",
        category: "Laptops",
        brand: "Apple",
        price: 2499,
        stock: 12,
        status: "In Stock",
        createdAt: "2026-01-12",
        updatedAt: "2026-07-18",
    };

    return (
        <div className="mx-auto max-w-6xl space-y-6 p-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <Link
                    href="/products"
                    className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"
                >
                    <ArrowLeft className="h-4 w-4" />
                    Back to Products
                </Link>

                <Link
                    href={`/products/${id}/edit`}
                    className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-primary-foreground hover:opacity-90"
                >
                    <Pencil className="h-4 w-4" />
                    Edit Product
                </Link>
            </div>

            {/* Title */}
            <div>
                <h1 className="text-3xl font-bold">{product.name}</h1>
                <p className="text-muted-foreground">
                    SKU: {product.sku}
                </p>
            </div>

            <div className="grid gap-6 lg:grid-cols-3">
                {/* Main */}
                <div className="space-y-6 lg:col-span-2">
                    <div className="rounded-xl border bg-card p-6">
                        <h2 className="mb-4 text-lg font-semibold">
                            Description
                        </h2>

                        <p className="text-muted-foreground">
                            {product.description}
                        </p>
                    </div>

                    <div className="rounded-xl border bg-card p-6">
                        <h2 className="mb-4 text-lg font-semibold">
                            Product Information
                        </h2>

                        <div className="grid gap-4 sm:grid-cols-2">
                            <Info label="Category" value={product.category} />
                            <Info label="Brand" value={product.brand} />
                            <Info label="Price" value={`$${product.price}`} />
                            <Info label="Stock" value={`${product.stock} units`} />
                        </div>
                    </div>
                </div>

                {/* Sidebar */}
                <div className="space-y-6">
                    <div className="rounded-xl border bg-card p-6">
                        <h2 className="mb-4 text-lg font-semibold">
                            Status
                        </h2>

                        <span className="rounded-full bg-green-100 px-3 py-1 text-sm font-medium text-green-700">
                            {product.status}
                        </span>
                    </div>

                    <div className="rounded-xl border bg-card p-6">
                        <h2 className="mb-4 text-lg font-semibold">
                            Metadata
                        </h2>

                        <div className="space-y-3">
                            <Info label="Product ID" value={product.id} />
                            <Info label="Created" value={product.createdAt} />
                            <Info label="Updated" value={product.updatedAt} />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

function Info({
    label,
    value,
}: {
    label: string;
    value: string;
}) {
    return (
        <div>
            <p className="text-sm text-muted-foreground">
                {label}
            </p>
            <p className="font-medium">{value}</p>
        </div>
    );
}