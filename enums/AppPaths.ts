import { toHandle } from "@/lib/handle";

export const AppPaths = {
    LOGIN: "/login",
    REGISTER: "/register",
    HOME: "/",
    DASHBOARD: "/dashboard",
}

/** Paths under `/[handler]`, scoped to a creator's username. */
export const CreatorPaths = {
    products: (username: string) => `/${toHandle(username)}/products`,
    productsNew: (username: string) => `/${toHandle(username)}/products/new`,
    product: (username: string, id: number | string, slug: string) =>
        `/${toHandle(username)}/products/${id}/${slug}`,
}
