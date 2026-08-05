// app/(app)/[handler]/products/[new]/[slug]/page.tsx

import { notFound } from "next/navigation";

import { ShowProduct } from "@/components/product-page/ShowProduct";
import { parseHandle } from "@/lib/handle";
import { getProduct } from "@/lib/actions/products";

export default async function Product({
    params,
}: PageProps<"/[handler]/products/[new]/[slug]">) {
    // `[new]` is the product id segment; `[handler]` was validated by the layout.
    const { handler, new: id } = await params;
    const username = parseHandle(handler)!;

    const product = await getProduct(Number(id));

    if (!product) {
        notFound();
    }

    return <ShowProduct product={product} username={username} />;
}
