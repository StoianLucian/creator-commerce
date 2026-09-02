import { notFound } from "next/navigation";

import CreateProductPage from "@/components/create-product-page/CreateProductPage";
import { parseHandle } from "@/lib/handle";
import { isHandleOwner } from "@/lib/data/creators";
import { getProductByHandle } from "@/lib/actions/products";
import type { CreateProductInput } from "@/form-validations/products";

export default async function EditProductPage({
    params,
}: {
    params: Promise<{ handler: string; new: string }>;
}) {
    const { handler, new: id } = await params;
    const username = parseHandle(handler)!;

    if (!(await isHandleOwner(username))) {
        notFound();
    }

    const product = await getProductByHandle(username, Number(id));

    if (!product) {
        notFound();
    }

    const initialValues: CreateProductInput = {
        name: product.name,
        description: product.description ?? "",
        categoryId: product.categoryId,
        status: product.status as CreateProductInput["status"],
        price: product.price,
        images: product.images.map((image) => ({
            url: image.imageUrl,
            key: image.imageKey,
        })),
    };

    return (
        <CreateProductPage productId={product.id} initialValues={initialValues} />
    );
}
