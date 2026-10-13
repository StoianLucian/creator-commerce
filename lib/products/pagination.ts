// lib/products/pagination.ts
//
// Shared pagination contract for the product catalog, used by the server
// actions (lib/actions/products.ts), the data hooks and the UI. Kept out of
// the "use server" action file so it can be imported anywhere — a "use
// server" module may only export async functions.

/** Products shown per page in every catalog listing. */
export const PRODUCTS_PAGE_SIZE = 8;

/** Page sizes the user can choose between in the pagination bar. */
export const PAGE_SIZE_OPTIONS = [8, 16, 24, 48] as const;

/** A single page of results plus the metadata the UI needs to paginate. */
export type Paginated<T> = {
    items: T[];
    total: number;
    page: number;
    pageSize: number;
    totalPages: number;
};
