import type { Readiness } from "../api/types"
import type { Language } from "../i18n"
import { uiText } from "../i18n"

interface ReadinessGaugeProps {
  readiness: Readiness | undefined
  language: Language
}

function ReadinessGauge({ readiness, language }: ReadinessGaugeProps) {
  const text = uiText[language]
  const score = readiness?.readiness_score ?? 0
  const circumference = 2 * Math.PI * 42
  const offset = circumference - (score / 100) * circumference

  return (
    <div className="flex items-center gap-4">
      <svg className="h-24 w-24 -rotate-90" viewBox="0 0 100 100">
        <circle
          cx="50"
          cy="50"
          fill="none"
          r="42"
          stroke="#e2e8f0"
          strokeWidth="10"
        />
        <circle
          cx="50"
          cy="50"
          fill="none"
          r="42"
          stroke={gaugeColor(score)}
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          strokeWidth="10"
        />
      </svg>
      <div>
        <p className="text-3xl font-black text-slate-950">{score}</p>
        <p className={`text-sm font-bold ${statusClass(readiness?.status)}`}>
          {statusLabel(readiness?.status, text)}
        </p>
      </div>
    </div>
  )
}

function gaugeColor(score: number) {
  if (score > 70) return "#059669"
  if (score >= 40) return "#d97706"
  return "#dc2626"
}

function statusClass(status: string | undefined) {
  if (status === "on_track") return "text-emerald-700"
  if (status === "at_risk") return "text-amber-700"
  return "text-red-700"
}

function statusLabel(status: string | undefined, text: typeof uiText.en) {
  if (status === "on_track") return text.onTrack
  if (status === "at_risk") return text.atRisk
  if (status === "critical") return text.critical
  return text.noReadinessYet
}

export default ReadinessGauge
