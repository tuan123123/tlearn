import type { TopicProgress } from "../api/types"
import type { Language } from "../i18n"
import { uiText } from "../i18n"

interface TopicProgressCardProps {
  progress: TopicProgress
  language: Language
}

function TopicProgressCard({ progress, language }: TopicProgressCardProps) {
  const text = uiText[language]
  const latest = progress.latest_mock_accuracy ?? progress.diagnostic_accuracy ?? 0

  return (
    <article className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
      <h3 className="font-bold text-slate-950">{progress.topic_name}</h3>
      <p className="mt-2 text-sm text-slate-600">
        {formatPercent(progress.diagnostic_accuracy)} → {formatPercent(progress.latest_mock_accuracy)} ·{" "}
        {formatSignedPercent(progress.change)}
      </p>
      <div className="mt-4 h-3 overflow-hidden rounded-full bg-slate-100">
        <div className={`h-full rounded-full ${barClass(latest)}`} style={{ width: `${latest * 100}%` }} />
      </div>
      <p className="mt-2 text-sm font-bold text-slate-700">
        {text.trend}: {trendLabel(progress.trend, text)}
      </p>
    </article>
  )
}

function formatPercent(value: number | null) {
  return value === null ? "—" : `${Math.round(value * 100)}%`
}

function formatSignedPercent(value: number | null) {
  if (value === null) return "—"
  const percent = Math.round(value * 100)
  return `${percent >= 0 ? "+" : ""}${percent}%`
}

function barClass(value: number) {
  if (value < 0.4) return "bg-red-600"
  if (value < 0.7) return "bg-amber-500"
  return "bg-emerald-600"
}

function trendLabel(trend: string, text: typeof uiText.en) {
  if (trend === "improving") return text.improving
  if (trend === "declining") return text.declining
  if (trend === "stagnant") return text.stagnant
  return text.insufficientData
}

export default TopicProgressCard
