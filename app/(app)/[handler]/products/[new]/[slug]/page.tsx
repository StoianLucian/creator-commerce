// app/(app)/[handler]/products/[new]/[slug]/page.tsx

import { notFound } from "next/navigation";

import { ShowProduct } from "@/components/products-page/ShowProduct";
import { parseHandle } from "@/lib/handle";
import { getProductByHandle } from "@/lib/actions/products";
import { isHandleOwner } from "@/lib/data/creators";

/**
 * Public product detail page: readable by anyone with the link, including
 * signed-out visitors coming from Explore.
 */
export default async function Product({
    params,
}: PageProps<"/[handler]/products/[new]/[slug]">) {
    // `[new]` is the product id segment; the layout validated `[handler]`'s shape.
    const { handler, new: id } = await params;
    const username = parseHandle(handler)!;

    const product = await getProductByHandle(username, Number(id));

    if (!product) {
        notFound();
    }

    // Owner-only affordances (the edit link) are gated on this, not on the
    // page being reachable.
    const isOwner = await isHandleOwner(username);

    return (
        <ShowProduct
            product={product}
            username={username}
            isOwner={isOwner}
        />
    );
}
