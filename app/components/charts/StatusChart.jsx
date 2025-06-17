"use client"

import { Line, LineChart, ResponsiveContainer, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from "recharts"

const statusData = [
  { year: 2010, value1: 5, value2: 5, value3: 5, value4: 5 },
  { year: 2011, value1: 15, value2: 10, value3: 12, value4: 8 },
  { year: 2012, value1: 25, value2: 18, value3: 20, value4: 15 },
  { year: 2013, value1: 40, value2: 25, value3: 28, value4: 22 },
  { year: 2014, value1: 60, value2: 35, value3: 30, value4: 28 },
  { year: 2015, value1: 65, value2: 40, value3: 45, value4: 35 },
  { year: 2016, value1: 80, value2: 55, value3: 50, value4: 45 },
  { year: 2017, value1: 95, value2: 65, value3: 60, value4: 55 },
  { year: 2018, value1: 110, value2: 70, value3: 68, value4: 60 },
  { year: 2019, value1: 125, value2: 85, value3: 80, value4: 75 },
]

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white p-4 border border-gray-200 rounded-lg shadow-lg">
        <p className="font-semibold text-gray-800 mb-2">{label}</p>
        {payload.map((entry, index) => (
          <p key={index} style={{ color: entry.color }}>
            {`${entry.dataKey}: ${entry.value}`}
          </p>
        ))}
      </div>
    )
  }
  return null
}

export default function StatusChart() {
  return (
    <div className="bg-white rounded-xl shadow-sm p-6">
      <h3 className="text-xl font-semibold text-gray-800 mb-6">Status User Range per Year</h3>

      <div className="h-96">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={statusData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
            <XAxis dataKey="year" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: "#6b7280" }} />
            <YAxis
              axisLine={false}
              tickLine={false}
              tick={{ fontSize: 12, fill: "#6b7280" }}
              label={{ value: "Units of Measure", angle: -90, position: "insideLeft" }}
            />
            <Tooltip content={<CustomTooltip />} />
            <Legend />
            <Line
              type="monotone"
              dataKey="value1"
              stroke="#3b82f6"
              strokeWidth={2}
              dot={{ fill: "#3b82f6", strokeWidth: 2, r: 4 }}
              activeDot={{ r: 6, stroke: "#3b82f6", strokeWidth: 2 }}
            />
            <Line
              type="monotone"
              dataKey="value2"
              stroke="#ef4444"
              strokeWidth={2}
              dot={{ fill: "#ef4444", strokeWidth: 2, r: 4 }}
              activeDot={{ r: 6, stroke: "#ef4444", strokeWidth: 2 }}
            />
            <Line
              type="monotone"
              dataKey="value3"
              stroke="#10b981"
              strokeWidth={2}
              dot={{ fill: "#10b981", strokeWidth: 2, r: 4 }}
              activeDot={{ r: 6, stroke: "#10b981", strokeWidth: 2 }}
            />
            <Line
              type="monotone"
              dataKey="value4"
              stroke="#f59e0b"
              strokeWidth={2}
              dot={{ fill: "#f59e0b", strokeWidth: 2, r: 4 }}
              activeDot={{ r: 6, stroke: "#f59e0b", strokeWidth: 2 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}
