"use client";

import { useTranslation } from "react-i18next";

import {
    Pagination,
    PaginationContent,
    PaginationEllipsis,
    PaginationItem,
    PaginationLink,
    PaginationNext,
    PaginationPrevious,
} from "@/components/ui/pagination";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { PAGE_SIZE_OPTIONS } from "@/lib/products/pagination";
import { cn } from "@/lib/utils";

interface ProductsPaginationProps {
    page: number;
    pageSize: number;
    totalPages: number;
    onPageChange: (page: number) => void;
    onPageSizeChange: (pageSize: number) => void;
    className?: string;
}

/**
 * Builds the list of page slots to render: always the first and last page,
 * the current page with one neighbour on each side, and an ellipsis (`null`)
 * wherever the sequence skips pages. Shared by every product listing.
 */
function pageItems(page: number, totalPages: number): (number | null)[] {
    const pages = new Set<number>([1, totalPages, page, page - 1, page + 1]);
    const sorted = [...pages]
        .filter((p) => p >= 1 && p <= totalPages)
        .sort((a, b) => a - b);

    const items: (number | null)[] = [];
    let previous = 0;
    for (const p of sorted) {
        if (previous && p - previous > 1) {
            items.push(null); // gap -> ellipsis
        }
        items.push(p);
        previous = p;
    }
    return items;
}

/**
 * Pagination bar for the product listings: a page-size selector on the left
 * and the numbered page controls pushed to the right. The page controls only
 * appear once there's more than one page; the size selector always shows so
 * the viewer can change how many products load at once.
 */
export function ProductsPagination({
    page,
    pageSize,
    totalPages,
    onPageChange,
    onPageSizeChange,
    className,
}: ProductsPaginationProps) {
    const { t } = useTranslation();

    const goTo = (target: number) => (event: React.MouseEvent) => {
        event.preventDefault();
        const clamped = Math.min(Math.max(1, target), totalPages);
        if (clamped !== page) onPageChange(clamped);
    };

    const isFirst = page <= 1;
    const isLast = page >= totalPages;

    const sizeItems = PAGE_SIZE_OPTIONS.map((n) => ({
        value: String(n),
        label: t("pagination.perPage", { n }),
    }));

    return (
        <div
            className={cn(
                "flex flex-col items-center gap-3 sm:flex-row sm:justify-between",
                className
            )}
        >
            <Select
                items={sizeItems}
                value={String(pageSize)}
                onValueChange={(value) => onPageSizeChange(Number(value))}
            >
                <SelectTrigger
                    className="data-[size=default]:h-9 w-32"
                    aria-label="Products per page"
                >
                    <SelectValue />
                </SelectTrigger>

                <SelectContent>
                    {PAGE_SIZE_OPTIONS.map((n) => (
                        <SelectItem key={n} value={String(n)}>
                            {t("pagination.perPage", { n })}
                        </SelectItem>
                    ))}
                </SelectContent>
            </Select>

            {totalPages > 1 && (
                <Pagination className="mx-0 w-auto justify-end">
                    <PaginationContent>
                        <PaginationItem>
                            <PaginationPrevious
                                href="#"
                                text={t("pagination.previous")}
                                onClick={goTo(page - 1)}
                                aria-disabled={isFirst}
                                className={
                                    isFirst ? "pointer-events-none opacity-50" : undefined
                                }
                            />
                        </PaginationItem>

                        {pageItems(page, totalPages).map((item, index) =>
                            item === null ? (
                                <PaginationItem key={`ellipsis-${index}`}>
                                    <PaginationEllipsis />
                                </PaginationItem>
                            ) : (
                                <PaginationItem key={item}>
                                    <PaginationLink
                                        href="#"
                                        isActive={item === page}
                                        onClick={goTo(item)}
                                    >
                                        {item}
                                    </PaginationLink>
                                </PaginationItem>
                            )
                        )}

                        <PaginationItem>
                            <PaginationNext
                                href="#"
                                text={t("pagination.next")}
                                onClick={goTo(page + 1)}
                                aria-disabled={isLast}
                                className={
                                    isLast ? "pointer-events-none opacity-50" : undefined
                                }
                            />
                        </PaginationItem>
                    </PaginationContent>
                </Pagination>
            )}
        </div>
    );
}
