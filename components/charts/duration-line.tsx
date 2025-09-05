"use client"

import { Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis, CartesianGrid } from "recharts"
import { SectionCard } from "@/components/ui/section-card"

const data = [
  { day: "Dec 16", duration: 20 },
  { day: "Dec 17", duration: 40 },
  { day: "Dec 18", duration: 30 },
  { day: "Dec 24", duration: 35 },
  { day: "Dec 25", duration: 20 },
  { day: "Dec 26", duration: 30 },
]

export default function DurationLineChart() {
  return (
    <SectionCard>
      <h3 className="mb-4 text-lg font-semibold">Session Duration Trend (minutes)</h3>
      <div className="h-64 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data}>
            <CartesianGrid strokeDasharray="4 4" stroke="#e5e7eb" />
            <XAxis dataKey="day" stroke="#6b7280" />
            <YAxis stroke="#6b7280" />
            <Tooltip />
            <Line type="monotone" dataKey="duration" stroke="#6366f1" strokeWidth={2} dot={{ r: 4 }} />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </SectionCard>
  )
}
