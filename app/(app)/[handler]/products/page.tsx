// app/(app)/[handler]/products/page.tsx

import Link from "next/link";
import { Plus, Search } from "lucide-react";
import Products from "./[new]/Products";
import { CreatorPaths } from "@/enums/AppPaths";
import { parseHandle } from "@/lib/handle";


export default async function ProductsPage({
    params,
}: PageProps<"/[handler]/products">) {
    const { handler } = await params;
    // The [handler] layout already validated this segment.
    const username = parseHandle(handler)!;

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
                    href={CreatorPaths.productsNew(username)}
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
                <Products />
            </div>
        </div>
    );
}