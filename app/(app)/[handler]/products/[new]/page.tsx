import { notFound } from "next/navigation";

import CreateProductPage from '@/components/create-product-page/CreateProductPage'
import { parseHandle } from "@/lib/handle";
import { isHandleOwner } from "@/lib/data/creators";

/**
 * The create form, at `/@handle/products/new`.
 *
 * Owner-only: the `[handler]` layout only validates the handle's shape now
 * that product detail pages are public, so the check lives here.
 */
async function Products({
    params,
}: PageProps<"/[handler]/products/[new]">) {
    const { handler } = await params;
    const username = parseHandle(handler)!;

    if (!(await isHandleOwner(username))) {
        notFound();
    }

    return (
        <CreateProductPage />
    )
}

export default Products