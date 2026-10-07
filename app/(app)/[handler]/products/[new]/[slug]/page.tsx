// app/(app)/[handler]/products/[new]/[slug]/page.tsx

import { notFound, redirect } from "next/navigation";

import { ShowProduct } from "@/components/products-page/ShowProduct";
import { DashboardPaths } from "@/enums/AppPaths";
import { parseHandle } from "@/lib/handle";
import { getProductByHandle } from "@/lib/actions/products";
import { isHandleOwner } from "@/lib/data/creators";

/**
 * The creator's own product detail — management view (Edit / Delete). Buyers
 * who follow a product link from Explore are sent to the shopper-facing
 * `/dashboard/[user]/[id]/[slug]` route instead, which shows Add to Cart.
 */
export default async function Product({
    params,
}: PageProps<"/[handler]/products/[new]/[slug]">) {
    // `[new]` is the product id segment; the layout validated `[handler]`'s shape.
    const { handler, new: id, slug } = await params;
    const username = parseHandle(handler)!;

    const product = await getProductByHandle(username, Number(id));

    if (!product) {
        notFound();
    }

    // This route is owner-only. Anyone else lands on the buyer-facing detail
    // (so shared/bookmarked links still resolve, just to the shopper view).
    const isOwner = await isHandleOwner(username);

    if (!isOwner) {
        redirect(DashboardPaths.product(username, id, slug));
    }

    return (
        <ShowProduct
            product={product}
            username={username}
            isOwner
        />
    );
}
