// app/(app)/[handler]/products/page.tsx

import { notFound } from "next/navigation";
import Products from "./[new]/Products";
import { parseHandle } from "@/lib/handle";
import { isHandleOwner } from "@/lib/data/creators";
import { OwnerProductsHeader } from "@/app/components/OwnerProductsHeader";


export default async function ProductsPage({
    params,
}: PageProps<"/[handler]/products">) {
    const { handler } = await params;
    const username = parseHandle(handler)!;

    if (!(await isHandleOwner(username))) {
        notFound();
    }

    return (
        <div className="space-y-6 px-12 py-8">
            <OwnerProductsHeader username={username} />
            <Products />
        </div>
    );
}