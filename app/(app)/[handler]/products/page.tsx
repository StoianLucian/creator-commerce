// app/(app)/[handler]/products/page.tsx

import Link from "next/link";
import { notFound } from "next/navigation";
import { Plus, Search } from "lucide-react";
import Products from "./[new]/Products";
import { CreatorPaths } from "@/enums/AppPaths";
import { parseHandle } from "@/lib/handle";
import { isHandleOwner } from "@/lib/data/creators";


export default async function ProductsPage({
    params,
}: PageProps<"/[handler]/products">) {
    const { handler } = await params;
    const username = parseHandle(handler)!;

    if (!(await isHandleOwner(username))) {
        notFound();
    }

    return (
        <div className="space-y-6 p-6">
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
            <Products />
        </div>
    );
}