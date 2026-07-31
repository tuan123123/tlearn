import type { MockExamListItem } from "../api/types"
import type { Language } from "../i18n"
import { uiText } from "../i18n"

interface MockExamCardProps {
  mockExam: MockExamListItem
  language: Language
}

function MockExamCard({ mockExam, language }: MockExamCardProps) {
  const text = uiText[language]

  return (
    <article className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
      <h2 className="text-xl font-bold text-slate-950">
        {text.mockExams} #{mockExam.mock_number}
      </h2>
      <p className="mt-1 text-sm text-slate-600">
        {new Date(mockExam.created_at).toLocaleString()}
      </p>
      <div className="mt-4 flex flex-wrap gap-2">
        <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-bold text-slate-700">
          {mockExam.question_count} {text.questionsCount}
        </span>
        {mockExam.latest_score !== null ? (
          <span className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-bold text-emerald-700">
            {Math.round(mockExam.latest_score * 100)}%
          </span>
        ) : null}
        {mockExam.vs_diagnostic !== null ? (
          <span className={badgeClass(mockExam.vs_diagnostic)}>
            {formatSignedPercent(mockExam.vs_diagnostic)} {text.vsDiagnostic}
          </span>
        ) : null}
        {mockExam.trend ? (
          <span className="rounded-full bg-purple-100 px-3 py-1 text-xs font-bold text-purple-700">
            {trendLabel(mockExam.trend, text)}
          </span>
        ) : null}
      </div>
    </article>
  )
}

function badgeClass(value: number) {
  return value >= 0
    ? "rounded-full bg-emerald-100 px-3 py-1 text-xs font-bold text-emerald-700"
    : "rounded-full bg-red-100 px-3 py-1 text-xs font-bold text-red-700"
}

function formatSignedPercent(value: number) {
  const percent = Math.round(value * 100)
  return `${percent >= 0 ? "+" : ""}${percent}%`
}

function trendLabel(trend: string, text: typeof uiText.en) {
  if (trend === "improving") return `↑ ${text.improving}`
  if (trend === "declining") return `↓ ${text.declining}`
  if (trend === "stagnant") return `→ ${text.stagnant}`
  return text.firstMock
}

export default MockExamCard
