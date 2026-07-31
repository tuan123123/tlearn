import type { ScoreHistoryEvent } from "../api/types"
import type { Language } from "../i18n"
import { uiText } from "../i18n"

interface HistoryTimelineProps {
  history: ScoreHistoryEvent[]
  language: Language
}

function HistoryTimeline({ history, language }: HistoryTimelineProps) {
  const text = uiText[language]

  return (
    <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="space-y-4 border-l-4 border-emerald-100 pl-5">
        {history.map((event, index) => {
          const previous = history[index - 1]
          const delta = previous ? event.total_score - previous.total_score : null
          return (
            <article key={event.id}>
              <p className="font-bold text-slate-950">
                {event.event_number === 0 ? text.diagnostic : `${text.mockExams} ${event.event_number}`}
              </p>
              <p className="text-sm text-slate-600">
                {new Date(event.recorded_at).toLocaleString()} · {Math.round(event.total_score * 100)}%
              </p>
              <p className="text-sm text-slate-600">
                {event.days_until_exam} {text.daysUntilExam}
                {delta !== null ? ` · ${formatSignedPercent(delta)}` : ""}
              </p>
            </article>
          )
        })}
      </div>
    </section>
  )
}

function formatSignedPercent(value: number) {
  const percent = Math.round(value * 100)
  return `${percent >= 0 ? "+" : ""}${percent}%`
}

export default HistoryTimeline
