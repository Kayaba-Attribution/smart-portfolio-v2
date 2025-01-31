"use client"

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
  ChartConfig,
  ChartContainer,
  ChartTooltipContent,
} from "@/components/ui/chart"

// Generate dummy historical data based on current value
function generateHistoricalData(currentValue: number) {
  const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun"]
  const data = []
  let value = currentValue * 0.7 // Start from 70% of current value

  for (let i = 0; i < months.length; i++) {
    const change = (Math.random() - 0.3) * 0.1 // -20% to +20% change
    value = value * (1 + change)
    data.push({
      month: months[i],
      value: Math.round(value * 100) / 100,
    })
  }
  return data
}

const chartConfig = {
  value: {
    label: "Portfolio Value",
    color: "hsl(var(--primary))",
  },
} satisfies ChartConfig

interface PortfolioChartProps {
  currentValue: number
}

export function PortfolioChart({ currentValue }: PortfolioChartProps) {
  const chartData = generateHistoricalData(currentValue)
  const lastMonth = chartData[chartData.length - 2].value
  const currentMonth = chartData[chartData.length - 1].value
  const monthlyChange = ((currentMonth - lastMonth) / lastMonth) * 100

  return (
    <Card>
      <CardHeader className="pb-4">
        <CardTitle className="text-base">Portfolio History</CardTitle>
        <CardDescription>6 month value trend</CardDescription>
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
                dataKey="month"
                tickLine={false}
                axisLine={false}
                tickMargin={8}
              />
              <defs>
                <linearGradient id="gradientArea" x1="0" y1="0" x2="0" y2="1">
                  <stop
                    offset="0%"
                    stopColor="hsl(var(--primary))"
                    stopOpacity={0.2}
                  />
                  <stop
                    offset="100%"
                    stopColor="hsl(var(--primary))"
                    stopOpacity={0}
                  />
                </linearGradient>
              </defs>
              <Area
                type="monotone"
                dataKey="value"
                stroke="hsl(var(--primary))"
                fill="url(#gradientArea)"
                strokeWidth={2}
              />
            </AreaChart>
          </ResponsiveContainer>
        </ChartContainer>
      </CardContent>
      <CardFooter>
        <div className="flex w-full items-center gap-2 text-sm">
          <div className="grid gap-1">
            <div className="flex items-center gap-2 font-medium">
              {monthlyChange >= 0 ? "Up" : "Down"} by {Math.abs(monthlyChange).toFixed(1)}% this month
              {monthlyChange >= 0 ? (
                <TrendingUp className="h-4 w-4 text-green-500" />
              ) : (
                <TrendingDown className="h-4 w-4 text-red-500" />
              )}
            </div>
            <div className="text-muted-foreground">
              January - June 2024
            </div>
          </div>
        </div>
      </CardFooter>
    </Card>
  )
} 