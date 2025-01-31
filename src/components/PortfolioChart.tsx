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
  let value = currentValue * 0.7 // Start from 70% of current value
  let stableValue = currentValue * 0.3 // Stable coins
  let cryptoValue = currentValue * 0.4 // Crypto assets
  let stocksValue = currentValue * 0.2 // Stocks
  
  const endDate = new Date()
  const startDate = new Date()
  startDate.setDate(startDate.getDate() - days)

  for (let date = new Date(startDate); date <= endDate; date.setDate(date.getDate() + 1)) {
    const change = (Math.random() - 0.3) * 0.1 // -20% to +20% change
    const stableChange = (Math.random() - 0.5) * 0.001 // Very small changes for stable
    const cryptoChange = (Math.random() - 0.3) * 0.15 // More volatile
    const stocksChange = (Math.random() - 0.3) * 0.08 // Moderate volatility
    
    value = value * (1 + change)
    stableValue = stableValue * (1 + stableChange)
    cryptoValue = cryptoValue * (1 + cryptoChange)
    stocksValue = stocksValue * (1 + stocksChange)
    
    data.push({
      date: date.toISOString().split('T')[0],
      total: Math.round(value * 100) / 100,
      stable: Math.round(stableValue * 100) / 100,
      crypto: Math.round(cryptoValue * 100) / 100,
      stocks: Math.round(stocksValue * 100) / 100,
    })
  }
  return data
}

const chartConfig = {
  total: {
    label: "Total Portfolio",
    color: "hsl(var(--primary))",
  },
  stable: {
    label: "Stable Coins",
    color: "hsl(var(--blue-500))",
  },
  crypto: {
    label: "Crypto Assets",
    color: "hsl(var(--orange-500))",
  },
  stocks: {
    label: "Stocks",
    color: "hsl(var(--green-500))",
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

  const lastValue = chartData[chartData.length - 2].total
  const currentMonthValue = chartData[chartData.length - 1].total
  const change = ((currentMonthValue - lastValue) / lastValue) * 100

  return (
    <Card>
      <CardHeader className="flex flex-col sm:flex-row items-center gap-4 space-y-0 border-b py-5">
        <div className="flex items-center gap-2 w-full justify-between sm:justify-start">
          <div className="grid gap-1">
            <CardTitle className="text-base">Net Worth Evolution</CardTitle>
            <CardDescription>Value trend over time</CardDescription>
          </div>
          <Select value={timeRange} onValueChange={setTimeRange}>
            <SelectTrigger className="w-[160px] rounded-lg">
              <SelectValue placeholder="Last 3 months" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="90d">Last 3 months</SelectItem>
              <SelectItem value="30d">Last 30 days</SelectItem>
              <SelectItem value="7d">Last 7 days</SelectItem>
            </SelectContent>
          </Select>
        </div>
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
              <CartesianGrid vertical={false} strokeDasharray="3 3" />
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
                content={
                  <ChartTooltipContent
                    labelFormatter={(value) => {
                      return new Date(value).toLocaleDateString("en-US", {
                        month: "long",
                        day: "numeric",
                        year: "numeric"
                      })
                    }}
                    valueFormatter={(value) => 
                      `$${Number(value).toLocaleString(undefined, {
                        maximumFractionDigits: 2,
                      })}`
                    }
                  />
                }
              />
              <defs>
                {Object.entries(chartConfig).map(([key, config]) => (
                  <linearGradient key={key} id={`gradient${key}`} x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor={config.color} stopOpacity={0.2} />
                    <stop offset="100%" stopColor={config.color} stopOpacity={0} />
                  </linearGradient>
                ))}
              </defs>
              <Area
                type="monotone"
                dataKey="total"
                stroke={chartConfig.total.color}
                fill="url(#gradienttotal)"
                strokeWidth={2}
                fillOpacity={0.2}
              />
              <Area
                type="monotone"
                dataKey="stable"
                stroke={chartConfig.stable.color}
                fill="url(#gradientstable)"
                strokeWidth={1}
                fillOpacity={0.1}
              />
              <Area
                type="monotone"
                dataKey="crypto"
                stroke={chartConfig.crypto.color}
                fill="url(#gradientcrypto)"
                strokeWidth={1}
                fillOpacity={0.1}
              />
              <Area
                type="monotone"
                dataKey="stocks"
                stroke={chartConfig.stocks.color}
                fill="url(#gradientstocks)"
                strokeWidth={1}
                fillOpacity={0.1}
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