"use client"

import { Bar, BarChart, CartesianGrid, Legend, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts"

const data = [
  {
    name: "Jan",
    income: 18000,
    expenses: 10000,
    profit: 8000,
  },
  {
    name: "Feb",
    income: 19500,
    expenses: 10200,
    profit: 9300,
  },
  {
    name: "Mar",
    income: 21000,
    expenses: 10500,
    profit: 10500,
  },
  {
    name: "Apr",
    income: 22000,
    expenses: 11000,
    profit: 11000,
  },
  {
    name: "May",
    income: 23500,
    expenses: 11200,
    profit: 12300,
  },
  {
    name: "Jun",
    income: 24580,
    expenses: 11500,
    profit: 13080,
  },
]

export function FinancialOverview() {
  return (
    <ResponsiveContainer width="100%" height={350}>
      <BarChart data={data}>
        <CartesianGrid strokeDasharray="3 3" vertical={false} />
        <XAxis dataKey="name" stroke="#888888" fontSize={12} tickLine={false} axisLine={false} />
        <YAxis
          stroke="#888888"
          fontSize={12}
          tickLine={false}
          axisLine={false}
          tickFormatter={(value) => `$${value}`}
        />
        <Tooltip
          formatter={(value) => [`$${value}`, ""]}
          labelFormatter={(label) => `Month: ${label}`}
          contentStyle={{
            backgroundColor: "#fff",
            border: "1px solid #e2e8f0",
            borderRadius: "6px",
            boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)",
          }}
        />
        <Legend />
        <Bar dataKey="income" name="Income" fill="#16a34a" radius={[4, 4, 0, 0]} />
        <Bar dataKey="expenses" name="Expenses" fill="#ef4444" radius={[4, 4, 0, 0]} />
        <Bar dataKey="profit" name="Net Profit" fill="#3b82f6" radius={[4, 4, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  )
}
