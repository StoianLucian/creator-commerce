import { toHandle } from "@/lib/handle";

export const AppPaths = {
    LOGIN: "/login",
    REGISTER: "/register",
    FORGOT_PASSWORD: "/forgot-password",
    RESET_PASSWORD: "/reset-password",
    EMAIL_VERIFIED: "/email-verified",
    HOME: "/",
    DASHBOARD: "/dashboard",
    SETTINGS: "/settings",
    WISHLIST: "/wishlist",
    ORDERS: "/orders",
    SALES: "/sales"
}

/** Paths under `/[handler]`, scoped to a creator's username. */
export const CreatorPaths = { 
    products: (username: string) => `/${toHandle(username)}/products`,
    productsNew: (username: string) => `/${toHandle(username)}/products/new`,
    product: (username: string, id: number | string, slug: string) =>
        `/${toHandle(username)}/products/${id}/${slug}`,
    productEdit: (username: string, id: number | string) =>
        `/${toHandle(username)}/products/${id}/edit`,
}
