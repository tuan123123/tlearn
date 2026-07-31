import type { WeakTopic } from "../api/types"
import type { Language } from "../i18n"
import { uiText } from "../i18n"

interface WeakTopicSummaryProps {
  weakTopics: WeakTopic[]
  language: Language
}

function WeakTopicSummary({ weakTopics, language }: WeakTopicSummaryProps) {
  const text = uiText[language]
  const topTopics = weakTopics.slice(0, 3)

  return (
    <aside className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
      <h2 className="text-lg font-bold text-slate-950">{text.weakTopicSummary}</h2>
      <div className="mt-4 space-y-3">
        {topTopics.map((topic) => (
          <div className="rounded-2xl bg-slate-50 p-3" key={topic.topic_name}>
            <p className="font-bold text-slate-900">{topic.topic_name}</p>
            <p className="mt-1 text-sm text-slate-600">
              {text.accuracy}: {Math.round(topic.accuracy * 100)}%
            </p>
            <p className="text-sm text-slate-600">
              {text.weaknessScore}: {Math.round(topic.weakness_score * 100)}%
            </p>
          </div>
        ))}
        {topTopics.length === 0 ? (
          <p className="text-sm text-slate-600">{text.noQuestions}</p>
        ) : null}
      </div>
    </aside>
  )
}

export default WeakTopicSummary
