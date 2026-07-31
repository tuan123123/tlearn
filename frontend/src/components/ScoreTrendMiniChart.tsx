import { Line, LineChart, ResponsiveContainer, Tooltip } from "recharts"

import type { ScoreHistoryEvent } from "../api/types"

interface ScoreTrendMiniChartProps {
  history: ScoreHistoryEvent[] | undefined
}

function ScoreTrendMiniChart({ history }: ScoreTrendMiniChartProps) {
  const data = (history ?? []).map((event) => ({
    label: event.event_number === 0 ? "Diagnostic" : `Mock ${event.event_number}`,
    score: Math.round(event.total_score * 100),
  }))

  if (data.length === 0) {
    return <div className="h-20 rounded-2xl bg-slate-50" />
  }

  return (
    <div className="h-20">
      <ResponsiveContainer height="100%" width="100%">
        <LineChart data={data}>
          <Tooltip />
          <Line dataKey="score" dot stroke="#2563eb" strokeWidth={3} type="monotone" />
        </LineChart>
      </ResponsiveContainer>
    </div>
  )
}

export default ScoreTrendMiniChart
