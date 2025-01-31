"use client"

import * as React from "react"
import { TrendingUp, TrendingDown } from "lucide-react"
import { Area, AreaChart, CartesianGrid, XAxis, ResponsiveContainer } from "recharts"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart"

// Generate dummy historical data based on current value
function generateHistoricalData(currentValue: number, days: number) {
  const data = []
  const endDate = new Date()
  const startDate = new Date()
  startDate.setDate(startDate.getDate() - days)

  for (let date = new Date(startDate); date <= endDate; date.setDate(date.getDate() + 1)) {
    data.push({
      date: date.toISOString().split('T')[0],
      stocks: Math.round(currentValue * 0.3 * (1 + Math.random() * 0.1) * 100) / 100,
      crypto: Math.round(currentValue * 0.4 * (1 + Math.random() * 0.2) * 100) / 100,
      stable: Math.round(currentValue * 0.3 * (1 + Math.random() * 0.01) * 100) / 100,
    })
  }
  return data
}

const chartConfig = {
  stocks: {
    label: "Stocks",
    color: "hsl(var(--chart-1))",
  },
  crypto: {
    label: "Crypto",
    color: "hsl(var(--chart-2))",
  },
  stable: {
    label: "Stable",
    color: "hsl(var(--chart-3))",
  },
} satisfies ChartConfig

interface PortfolioChartProps {
  currentValue: number
}

export function PortfolioChart({ currentValue }: PortfolioChartProps) {
  const [timeRange, setTimeRange] = React.useState("90d")
  
  const getDaysFromRange = (range: string) => {
    switch (range) {
      case "7d": return 7
      case "30d": return 30
      case "90d": return 90
      default: return 90
    }
  }

  const chartData = React.useMemo(() => 
    generateHistoricalData(currentValue, getDaysFromRange(timeRange)),
    [currentValue, timeRange]
  )

  const lastValue = chartData[chartData.length - 2]
  const currentMonthValue = chartData[chartData.length - 1]
  const totalLast = lastValue.stocks + lastValue.crypto + lastValue.stable
  const totalCurrent = currentMonthValue.stocks + currentMonthValue.crypto + currentMonthValue.stable
  const change = ((totalCurrent - totalLast) / totalLast) * 100

  return (
    <Card>
      <CardHeader className="flex items-center gap-2 space-y-0 border-b py-5 sm:flex-row">
        <div className="grid flex-1 gap-1 text-center sm:text-left">
          <CardTitle className="text-base">Portfolio History</CardTitle>
          <CardDescription>Value trend over time</CardDescription>
        </div>
        <Select value={timeRange} onValueChange={setTimeRange}>
          <SelectTrigger className="w-[160px] rounded-lg sm:ml-auto">
            <SelectValue placeholder="Last 3 months" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="90d">Last 3 months</SelectItem>
            <SelectItem value="30d">Last 30 days</SelectItem>
            <SelectItem value="7d">Last 7 days</SelectItem>
          </SelectContent>
        </Select>
      </CardHeader>
      <CardContent className="pb-4">
        <ChartContainer config={chartConfig}>
          <ResponsiveContainer width="100%" height={200}>
            <AreaChart
              data={chartData}
              margin={{
                left: 0,
                right: 0,
                top: 16,
                bottom: 0,
              }}
            >
              <CartesianGrid vertical={false} />
              <XAxis
                dataKey="date"
                tickLine={false}
                axisLine={false}
                tickMargin={8}
                minTickGap={32}
                tickFormatter={(value) => {
                  const date = new Date(value)
                  return date.toLocaleDateString("en-US", {
                    month: "short",
                    day: "numeric",
                  })
                }}
              />
              <ChartTooltip
                cursor={false}
                content={<ChartTooltipContent indicator="dot" />}
              />
              <Area
                type="monotone"
                dataKey="stable"
                stackId="a"
                fill="var(--color-stable)"
                fillOpacity={0.4}
                stroke="var(--color-stable)"
              />
              <Area
                type="monotone"
                dataKey="crypto"
                stackId="a"
                fill="var(--color-crypto)"
                fillOpacity={0.4}
                stroke="var(--color-crypto)"
              />
              <Area
                type="monotone"
                dataKey="stocks"
                stackId="a"
                fill="var(--color-stocks)"
                fillOpacity={0.4}
                stroke="var(--color-stocks)"
              />
            </AreaChart>
          </ResponsiveContainer>
        </ChartContainer>
      </CardContent>
      <CardFooter>
        <div className="flex w-full items-center gap-2 text-sm">
          <div className="grid gap-1">
            <div className="flex items-center gap-2 font-medium">
              {change >= 0 ? "Up" : "Down"} by {Math.abs(change).toFixed(1)}%
              {change >= 0 ? (
                <TrendingUp className="h-4 w-4 text-green-500" />
              ) : (
                <TrendingDown className="h-4 w-4 text-red-500" />
              )}
            </div>
            <div className="text-muted-foreground">
              Last {timeRange === "7d" ? "7 days" : timeRange === "30d" ? "30 days" : "3 months"}
            </div>
          </div>
        </div>
      </CardFooter>
    </Card>
  )
} 