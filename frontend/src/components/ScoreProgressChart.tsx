import {
  CartesianGrid,
  ComposedChart,
  LabelList,
  Line,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts"

import type { ScoreHistoryEvent } from "../api/types"

interface ScoreProgressChartProps {
  history: ScoreHistoryEvent[]
}

function ScoreProgressChart({ history }: ScoreProgressChartProps) {
  const data = history.map((event) => ({
    label: event.event_number === 0 ? "Diagnostic" : `Mock ${event.event_number}`,
    score: Math.round(event.total_score * 100),
  }))

  return (
    <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="h-80">
        <ResponsiveContainer height="100%" width="100%">
          <ComposedChart data={data}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="label" />
            <YAxis domain={[0, 100]} />
            <Tooltip />
            <ReferenceLine label="60%" stroke="#d97706" strokeDasharray="4 4" y={60} />
            <Line dataKey="score" dot stroke="#2563eb" strokeWidth={3} type="monotone">
              <LabelList dataKey="score" position="top" />
            </Line>
          </ComposedChart>
        </ResponsiveContainer>
      </div>
    </section>
  )
}

export default ScoreProgressChart
