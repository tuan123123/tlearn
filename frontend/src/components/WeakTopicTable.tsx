import type { TopicScore } from "../api/types"
import type { Language } from "../i18n"
import { uiText } from "../i18n"

interface WeakTopicTableProps {
  topicScores: Record<string, TopicScore>
  language: Language
}

function WeakTopicTable({ topicScores, language }: WeakTopicTableProps) {
  const text = uiText[language]
  const rows = Object.entries(topicScores)
    .map(([topicName, score]) => ({ topicName, ...score }))
    .sort((a, b) => b.weakness_score - a.weakness_score)

  return (
    <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
      <h2 className="text-xl font-bold text-slate-950">{text.topicScores}</h2>
      <div className="mt-4 overflow-x-auto">
        <table className="w-full min-w-[640px] text-left text-sm">
          <thead className="text-slate-500">
            <tr>
              <th className="py-2 pr-4">{text.topic}</th>
              <th className="py-2 pr-4">{text.accuracy}</th>
              <th className="py-2 pr-4">{text.avgTime}</th>
              <th className="py-2 pr-4">{text.weaknessScore}</th>
              <th className="py-2">{text.level}</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr className="border-t border-slate-100" key={row.topicName}>
                <td className="py-3 pr-4 font-semibold text-slate-900">{row.topicName}</td>
                <td className="py-3 pr-4">{formatPercent(row.accuracy)}</td>
                <td className="py-3 pr-4">{Math.round(row.avg_time)}s</td>
                <td className="py-3 pr-4">{formatPercent(row.weakness_score)}</td>
                <td className="py-3">
                  <span className={`rounded-full px-3 py-1 text-xs font-bold ${levelClass(row.accuracy)}`}>
                    {levelLabel(row.accuracy, text)}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  )
}

function formatPercent(value: number) {
  return `${Math.round(value * 100)}%`
}

function levelLabel(accuracy: number, text: ReturnType<typeof getText>) {
  if (accuracy < 0.4) {
    return text.weak
  }
  if (accuracy <= 0.6) {
    return text.watch
  }
  return text.strong
}

function levelClass(accuracy: number) {
  if (accuracy < 0.4) {
    return "bg-red-100 text-red-700"
  }
  if (accuracy <= 0.6) {
    return "bg-amber-100 text-amber-700"
  }
  return "bg-emerald-100 text-emerald-700"
}

function getText(language: Language) {
  return uiText[language]
}

export default WeakTopicTable
