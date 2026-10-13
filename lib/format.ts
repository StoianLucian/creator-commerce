// lib/format.ts

/** Prices are stored as whole lei, so no fractional digits are shown. */
export const priceFormatter = new Intl.NumberFormat("ro-RO", {
    style: "currency",
    currency: "RON",
    currencyDisplay: "narrowSymbol",
    maximumFractionDigits: 0,
});

/** Fixed timezone so the server-rendered date matches the client. */
export const dateFormatter = new Intl.DateTimeFormat("en-US", {
    dateStyle: "medium",
    timeZone: "UTC",
});
