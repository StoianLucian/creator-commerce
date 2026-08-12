"use client"

import {
    Line,
    LineChart,
    CartesianGrid,
    XAxis,
    LabelList,
} from "recharts"

import {
    ChartContainer,
    ChartTooltip,
    ChartTooltipContent,
    type ChartConfig,
} from "@/components/ui/chart"
import { priceFormatter } from "@/lib/format"

/** One point per x-axis tick; keys match the `dataKey`s below. */
export type RevenuePoint = {
    /** `YYYY-MM-DD`. */
    date: string
    /** Whole dollars — the chart never sees cents. */
    revenue: number
}

// Keys have to match the series `dataKey`, that's how the tooltip finds the
// label and the `--color-revenue` variable.
const chartConfig = {
    revenue: {
        label: "Revenue",
        color: "var(--primary)",
    },
} satisfies ChartConfig

export function MyChart({ data }: { data: RevenuePoint[] }) {
    return (
        <ChartContainer config={chartConfig} className="h-75 w-full">
            <LineChart data={data} margin={{ top: 20 }}>
                <CartesianGrid vertical={false} />

                <XAxis
                    dataKey="date"
                    tickLine={true}
                    axisLine={true}
                    tickFormatter={(date: string) => date.slice(5)}
                />
                <ChartTooltip
                    content={
                        <ChartTooltipContent
                            formatter={(value) => priceFormatter.format(Number(value))}
                        />
                    }
                />
                <Line
                    type="monotone"
                    dataKey="revenue"
                    stroke="var(--color-revenue)"
                    strokeWidth={2}
                    dot
                >
                    <LabelList
                        dataKey="revenue"
                        position="top"
                        className="fill-muted-foreground"
                        formatter={(value) => priceFormatter.format(Number(value))}
                    />
                </Line>
            </LineChart>
        </ChartContainer>
    )
}
