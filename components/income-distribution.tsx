"use client"

import { Cell, Legend, Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts"

const data = [
  { name: "Oakwood Apartments", value: 12500 },
  { name: "Riverside Condos", value: 6800 },
  { name: "Sunset Villas", value: 3200 },
  { name: "Meadow View Townhomes", value: 2080 },
]

const COLORS = ["#16a34a", "#3b82f6", "#eab308", "#8b5cf6"]

export function IncomeDistribution() {
  return (
    <ResponsiveContainer width="100%" height="100%">
      <PieChart>
        <Pie
          data={data}
          cx="50%"
          cy="50%"
          labelLine={false}
          outerRadius={80}
          fill="#8884d8"
          dataKey="value"
          label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
        >
          {data.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
          ))}
        </Pie>
        <Tooltip
          formatter={(value) => [`$${value}`, "Revenue"]}
          contentStyle={{
            backgroundColor: "#fff",
            border: "1px solid #e2e8f0",
            borderRadius: "6px",
            boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)",
          }}
        />
        <Legend />
      </PieChart>
    </ResponsiveContainer>
  )
}
