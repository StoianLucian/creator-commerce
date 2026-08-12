// lib/format.ts

/** Prices are stored as whole dollars, so no fractional digits are shown. */
export const priceFormatter = new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
});

/** Fixed timezone so the server-rendered date matches the client. */
export const dateFormatter = new Intl.DateTimeFormat("en-US", {
    dateStyle: "medium",
    timeZone: "UTC",
});
