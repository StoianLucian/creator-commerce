// app/products/page.tsx

import Link from "next/link";
import { Plus, Search } from "lucide-react";

const products = [
    {
        id: "1",
        slug: "macbook-pro",
        name: "MacBook Pro",
        sku: "MBP-001",
        price: 2499,
        stock: 12,
        status: "In Stock",
    },
    {
        id: "2",
        slug: "magic-mouse",
        name: "Magic Mouse",
        sku: "MM-002",
        price: 99,
        stock: 38,
        status: "In Stock",
    },
    {
        id: "3",
        slug: "airpods-pro",
        name: "AirPods Pro",
        sku: "APP-003",
        price: 249,
        stock: 0,
        status: "Out of Stock",
    },
];

export default function ProductsPage() {
    return (
        <div className="space-y-6 p-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold">Products</h1>
                    <p className="text-muted-foreground">
                        Manage your product catalog.
                    </p>
                </div>

                <Link
                    href="/products/new"
                    className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-primary-foreground hover:opacity-90"
                >
                    <Plus className="h-4 w-4" />
                    New Product
                </Link>
            </div>

            {/* Search */}
            <div className="relative max-w-md">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <input
                    type="text"
                    placeholder="Search products..."
                    className="w-full rounded-lg border bg-background py-2 pl-10 pr-4 outline-none focus:ring-2 focus:ring-primary"
                />
            </div>

            {/* Products */}
            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                {products.map((product) => (
                    <Link
                        key={product.id}
                        href={`/products/${product.id}/${product.slug}`}
                        className="rounded-xl border bg-card p-5 transition hover:border-primary hover:shadow-md"
                    >
                        <div className="flex items-start justify-between">
                            <div>
                                <h2 className="font-semibold text-lg">{product.name}</h2>
                                <p className="text-sm text-muted-foreground">
                                    SKU: {product.sku}
                                </p>
                            </div>

                            <span
                                className={`rounded-full px-2 py-1 text-xs font-medium ${product.stock > 0
                                    ? "bg-green-100 text-green-700"
                                    : "bg-red-100 text-red-700"
                                    }`}
                            >
                                {product.status}
                            </span>
                        </div>

                        <div className="mt-6 flex items-center justify-between">
                            <span className="text-2xl font-bold">
                                ${product.price}
                            </span>

                            <span className="text-sm text-muted-foreground">
                                {product.stock} in stock
                            </span>
                        </div>
                    </Link>
                ))}
            </div>
        </div>
    );
}