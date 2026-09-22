"use client";

import { Loader2, Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";

import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { useDeleteProduct } from "@/hooks/useOwnProducts";

interface DeleteProductButtonProps {
    productId: number;
    productName: string;
    /** Optional button text; icon-only when omitted (e.g. on product cards). */
    label?: string;
    /**
     * Where to go after a successful delete. Needed on the product detail
     * page, which 404s once the product is soft-deleted.
     */
    redirectTo?: string;
}

export function DeleteProductButton({
    productId,
    productName,
    label,
    redirectTo,
}: DeleteProductButtonProps) {
    const deleteProduct = useDeleteProduct();
    const router = useRouter();

    const handleDelete = () => {
        deleteProduct.mutate(productId, {
            onSuccess: (result) => {
                if (result.success && redirectTo) {
                    router.push(redirectTo);
                }
            },
        });
    };

    return (
        <AlertDialog>
            <AlertDialogTrigger
                render={<Button variant="destructive" size={label ? "default" : "sm"} />}
                disabled={deleteProduct.isPending}
                aria-label={`Delete ${productName}`}
            >
                {deleteProduct.isPending ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                    <Trash2 className="h-4 w-4" />
                )}
                {label}
            </AlertDialogTrigger>

            <AlertDialogContent>
                <AlertDialogHeader>
                    <AlertDialogTitle>Delete “{productName}”?</AlertDialogTitle>
                    <AlertDialogDescription>
                        This removes the product from your store and the marketplace.
                        Past orders keep their record of it. This can’t be undone.
                    </AlertDialogDescription>
                </AlertDialogHeader>

                <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction onClick={handleDelete}>
                        Delete
                    </AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    );
}
