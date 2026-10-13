"use client";

import { Loader2, Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useTranslation } from "react-i18next";

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
    /** Trigger button styling; defaults keep the standalone destructive look. */
    variant?: React.ComponentProps<typeof Button>["variant"];
    size?: React.ComponentProps<typeof Button>["size"];
    className?: string;
}

export function DeleteProductButton({
    productId,
    productName,
    label,
    redirectTo,
    variant = "destructive",
    size,
    className,
}: DeleteProductButtonProps) {
    const deleteProduct = useDeleteProduct();
    const router = useRouter();
    const { t } = useTranslation();

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
                render={
                    <Button
                        variant={variant}
                        size={size ?? (label ? "default" : "sm")}
                        className={className}
                    />
                }
                disabled={deleteProduct.isPending}
                aria-label={t("deleteDialog.trigger", { name: productName })}
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
                    <AlertDialogTitle>{t("deleteDialog.title", { name: productName })}</AlertDialogTitle>
                    <AlertDialogDescription>
                        {t("deleteDialog.desc")}
                    </AlertDialogDescription>
                </AlertDialogHeader>

                <AlertDialogFooter>
                    <AlertDialogCancel>{t("deleteDialog.cancel")}</AlertDialogCancel>
                    <AlertDialogAction onClick={handleDelete}>
                        {t("deleteDialog.confirm")}
                    </AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    );
}
