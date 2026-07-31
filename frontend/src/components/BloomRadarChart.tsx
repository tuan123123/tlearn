import {
  PolarAngleAxis,
  PolarGrid,
  PolarRadiusAxis,
  Radar,
  RadarChart,
  ResponsiveContainer,
} from "recharts"

import type { BloomScore } from "../api/types"
import type { Language } from "../i18n"
import { uiText } from "../i18n"

interface BloomRadarChartProps {
  bloomScores: Record<string, BloomScore>
  language: Language
}

const BLOOM_LABELS = ["Remember", "Understand", "Apply", "Analyze", "Evaluate", "Create"]

function BloomRadarChart({ bloomScores, language }: BloomRadarChartProps) {
  const text = uiText[language]
  const data = BLOOM_LABELS.map((label, index) => {
    const bloomLevel = String(index + 1)
    return {
      bloom: `L${bloomLevel} ${label}`,
      accuracy: Math.round((bloomScores[bloomLevel]?.accuracy ?? 0) * 100),
    }
  })

  return (
    <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
      <h2 className="text-xl font-bold text-slate-950">{text.bloomRadar}</h2>
      <div className="mt-4 h-80">
        <ResponsiveContainer height="100%" width="100%">
          <RadarChart data={data}>
            <PolarGrid />
            <PolarAngleAxis dataKey="bloom" tick={{ fontSize: 12 }} />
            <PolarRadiusAxis angle={90} domain={[0, 100]} tick={{ fontSize: 11 }} />
            <Radar
              dataKey="accuracy"
              fill="#8b5cf6"
              fillOpacity={0.35}
              name={text.accuracy}
              stroke="#7c3aed"
            />
          </RadarChart>
        </ResponsiveContainer>
      </div>
    </section>
  )
}

export default BloomRadarChart
