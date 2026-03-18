"use client"

import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis } from "recharts"

const data = [
  {
    name: "Jan",
    revenue: 18000,
    expenses: 10000,
  },
  {
    name: "Feb",
    revenue: 19500,
    expenses: 10200,
  },
  {
    name: "Mar",
    revenue: 21000,
    expenses: 10500,
  },
  {
    name: "Apr",
    revenue: 22000,
    expenses: 11000,
  },
  {
    name: "May",
    revenue: 23500,
    expenses: 11200,
  },
  {
    name: "Jun",
    revenue: 24580,
    expenses: 11500,
  },
]

export function Overview() {
  return (
    <ResponsiveContainer width="100%" height={350}>
      <BarChart data={data}>
        <XAxis dataKey="name" stroke="#888888" fontSize={12} tickLine={false} axisLine={false} />
        <YAxis
          stroke="#888888"
          fontSize={12}
          tickLine={false}
          axisLine={false}
          tickFormatter={(value) => `$${value}`}
        />
        <Bar dataKey="revenue" fill="#16a34a" radius={[4, 4, 0, 0]} />
        <Bar dataKey="expenses" fill="#ef4444" radius={[4, 4, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  )
}
