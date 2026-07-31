import type { TimeBand } from "../api/types"
import type { Language } from "../i18n"
import { uiText } from "../i18n"

interface TimeBandBannerProps {
  daysUntilExam: number
  timeBand: TimeBand
  questionCount: number
  durationMinutes: number | null
  language: Language
}

function TimeBandBanner({
  daysUntilExam,
  timeBand,
  questionCount,
  durationMinutes,
  language,
}: TimeBandBannerProps) {
  const text = uiText[language]

  return (
    <section className={`rounded-3xl p-5 text-white ${bannerClass(timeBand)}`}>
      <p className="text-sm font-bold uppercase tracking-wide">
        {daysUntilExam} {text.daysUntilExam}
      </p>
      <h2 className="mt-2 text-2xl font-black">
        {timeBand === "exam_day"
          ? text.examDayChecklist
          : `${text.fullMock}: ${questionCount} ${text.questionsCount}, ${durationMinutes} ${text.minutes}`}
      </h2>
    </section>
  )
}

function bannerClass(timeBand: TimeBand) {
  if (timeBand === "14+") return "bg-emerald-700"
  if (timeBand === "7-13") return "bg-teal-700"
  if (timeBand === "3-6") return "bg-amber-600"
  if (timeBand === "1-2") return "bg-red-700"
  return "bg-purple-700"
}

export default TimeBandBanner
