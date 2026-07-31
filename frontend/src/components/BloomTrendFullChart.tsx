import {
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts"

import type { BloomTrend, ScoreHistoryEvent } from "../api/types"

interface BloomTrendFullChartProps {
  bloomTrend: BloomTrend[]
  history: ScoreHistoryEvent[]
}

const COLORS = ["#2563eb", "#7c3aed", "#059669", "#d97706", "#dc2626", "#0f766e"]

function BloomTrendFullChart({ bloomTrend, history }: BloomTrendFullChartProps) {
  const rows = history.map((event) => {
    const row: Record<string, string | number> = {
      label: event.event_number === 0 ? "Diagnostic" : `Mock ${event.event_number}`,
    }
    for (const bloom of bloomTrend) {
      const point = bloom.points.find(
        (item) => item.event_number === event.event_number && item.event_type === event.event_type,
      )
      row[`L${bloom.bloom_level}`] = Math.round((point?.accuracy ?? 0) * 100)
    }
    return row
  })

  return (
    <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="h-80">
        <ResponsiveContainer height="100%" width="100%">
          <LineChart data={rows}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="label" />
            <YAxis domain={[0, 100]} />
            <Tooltip />
            <Legend />
            {[1, 2, 3, 4, 5, 6].map((level, index) => (
              <Line
                dataKey={`L${level}`}
                key={level}
                stroke={COLORS[index]}
                strokeWidth={2}
                type="monotone"
              />
            ))}
          </LineChart>
        </ResponsiveContainer>
      </div>
    </section>
  )
}

export default BloomTrendFullChart
