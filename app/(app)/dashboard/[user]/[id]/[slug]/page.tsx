// app/(app)/dashboard/[user]/[id]/[slug]/page.tsx

import { notFound } from "next/navigation";

import { ShowProduct } from "@/components/products-page/ShowProduct";
import { getProductByHandle } from "@/lib/actions/products";

/**
 * Buyer-facing product detail, reached from Explore. Always the shopper's
 * view (Add to Cart), never the owner's management actions — those live on
 * the creator's own `/@handle/products/...` route.
 */
export default async function ExploreProduct({
    params,
}: PageProps<"/dashboard/[user]/[id]/[slug]">) {
    const { user, id } = await params;

    const product = await getProductByHandle(user, Number(id));

    if (!product) {
        notFound();
    }

    return <ShowProduct product={product} username={user} isOwner={false} />;
}
