import { useState } from "react"

import type { DayPlan } from "../api/types"
import type { Language } from "../i18n"
import { uiText } from "../i18n"

interface DayPlanCardProps {
  day: DayPlan
  language: Language
}

function DayPlanCard({ day, language }: DayPlanCardProps) {
  const text = uiText[language]
  const [checkedActivities, setCheckedActivities] = useState<Record<number, boolean>>({})

  function toggleActivity(index: number) {
    setCheckedActivities((current) => ({
      ...current,
      [index]: !current[index],
    }))
  }

  return (
    <article className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
      <div className="flex flex-col justify-between gap-4 sm:flex-row">
        <div>
          <h2 className="text-2xl font-bold text-slate-950">{day.date_label}</h2>
          <div className="mt-3 flex flex-wrap gap-2">
            {day.focus_topics.map((topic) => (
              <span className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-bold text-emerald-700" key={topic}>
                {topic}
              </span>
            ))}
          </div>
        </div>
        <span className="h-fit rounded-full bg-slate-100 px-4 py-2 text-sm font-bold text-slate-700">
          {day.estimated_hours} {text.hours}
        </span>
      </div>

      <div className="mt-4 flex flex-wrap gap-2">
        {day.bloom_focus.map((bloom) => (
          <span className="rounded-full bg-purple-100 px-3 py-1 text-xs font-bold text-purple-700" key={bloom}>
            {bloom}
          </span>
        ))}
      </div>

      <div className="mt-5 space-y-3">
        {day.activities.map((activity, index) => (
          <label
            className="flex cursor-pointer gap-3 rounded-2xl border border-slate-200 p-3 text-sm text-slate-700"
            key={`${day.day_number}-${activity}`}
          >
            <input
              checked={Boolean(checkedActivities[index])}
              type="checkbox"
              onChange={() => toggleActivity(index)}
            />
            <span className={checkedActivities[index] ? "line-through opacity-60" : ""}>
              {activity}
            </span>
          </label>
        ))}
      </div>

      <div className="mt-5 flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
        <p className="text-sm font-semibold text-slate-600">
          {text.suggestedPractice}: {day.practice_question_count} {text.practiceQuestions}
        </p>
        <button
          className="rounded-xl border border-slate-300 px-4 py-2 text-sm font-bold text-slate-700"
          type="button"
          onClick={() => window.alert(text.practiceComing)}
        >
          {text.practiceTheseTopics}
        </button>
      </div>
    </article>
  )
}

export default DayPlanCard
